const { default: axios } = require('axios')
const { app, BrowserWindow, ipcMain, BrowserView } = require('electron')
const path = require('path')
const Store = require('electron-store')

const store = new Store()

require('electron-reload')(__dirname);

const MAIN_PAGE_URL = 'https://www.bbc.co.uk/iplayer'

let mainWindow = null

const ifInstallingQuitEarly = () => {
    if (require('electron-squirrel-startup')) app.quit()
}

ifInstallingQuitEarly()

const getLockOrQuit = () => {
    const lock = app.requestSingleInstanceLock()
    if (!lock) {
        app.quit()
        process.exit(0)
    }
}

getLockOrQuit()

const createWindow = () => {
    mainWindow = new BrowserWindow({
        autoHideMenuBar: true,
        width: 800,
        height: 600,
        icon: 'icons/icon.png'
    })

    mainWindow.maximize()
    mainWindow.on('closed', app.quit)

    const progressView = new BrowserView()
    progressView.setBounds({ x: 0, y: 0, width: mainWindow.getBounds().width, height: 5 })
    progressView.webContents.loadFile('indeterminate-progress-bar.html')

    const showProgressBar = () => {
        mainWindow.addBrowserView(progressView)
    }
    
    const hideProgressBar = () => {
        mainWindow.removeBrowserView(progressView)
    }

    const backToIPlayerView = new BrowserView({ 
        webPreferences: { 
            preload: path.join(__dirname, 'preload.js') 
        }
    })
    backToIPlayerView.setBounds({ x: 0, y: 0, width: 80, height: 80 })
    backToIPlayerView.webContents.loadFile('back-to-iplayer.html')
    const showBack = () => {
        mainWindow.addBrowserView(backToIPlayerView)
    }
    const hideBack = () => {
        mainWindow.removeBrowserView(backToIPlayerView)
    }

    // needed because otherwise, it won't show up later
    showBack()
    hideBack()

    mainWindow.webContents.on('did-start-loading', showProgressBar)
    mainWindow.webContents.on('did-stop-loading', hideProgressBar)
    mainWindow.webContents.on('did-navigate', (event, url) => {
        if (!url.startsWith(MAIN_PAGE_URL)) {
            showBack()
        } else {
            hideBack()
        }
        store.set('last-url', url)
    })

    const lastUrl = store.get('last-url')
    if (lastUrl) {
        mainWindow.loadURL(lastUrl)
        store.clear('last-url') // Clear just-in-case the app launching fails
    } else {
        mainWindow.loadURL(MAIN_PAGE_URL)
    }

    mainWindow.show()
}

const listenForMessage = () => {
    ipcMain.on('reminder-message', (event, message) => {
        if (message === 'dont-show-again') {
            stopVerifying = true
        }
        else if (message === 'proper-location-set') {
            verifyCurrentIpIsUK()
        }
    })

    ipcMain.on('return-to-iPlayer', (event) => {
        mainWindow.loadURL(MAIN_PAGE_URL)
    })
}

app.whenReady().then(() => {
    createWindow()
    listenForMessage()
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

app.on('second-instance', (event, commandLine, workingDirectory) => {
    if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore()
        mainWindow.focus()
    }
})

const showWrongIPLocationMessage = ({ onClose }) => {
    const messageWindow = new BrowserWindow({
        autoHideMenuBar: true,
        width: 500,
        height: 300,
        resizable: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        },
        parent: mainWindow,
        modal: true,
    })

    messageWindow.loadFile(path.join(__dirname, 'message.html'))
    messageWindow.on('close', onClose)
    messageWindow.show()
}

const getCurrentIPLocationInfo = async () => {
    const response = await axios.get('http://ip-api.com/json')

    return response.data
}

const TEN_SECONDS = 10 * 1000
const verifyIPIn10Seconds = () => setTimeout(verifyCurrentIpIsUK, TEN_SECONDS)

let stopVerifying = false
let hadFailedLocationCheck = false

const verifyCurrentIpIsUK = async () => {    
    if (stopVerifying) return

    try {
        const body = await getCurrentIPLocationInfo()
        if (body.status !== 'success') {
            throw new Error('Unsuccessful location information')
        }

        if (body.countryCode !== 'GB') {
            hadFailedLocationCheck = true
            showWrongIPLocationMessage({ onClose: verifyIPIn10Seconds })
        } else {
            if (hadFailedLocationCheck) {
                hadFailedLocationCheck = false
                mainWindow.webContents.reloadIgnoringCache()
            }
            verifyIPIn10Seconds()
        }
    } catch (error) {
        console.log("Error", error)
    }
}

verifyCurrentIpIsUK()
