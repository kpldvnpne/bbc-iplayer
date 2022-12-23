const { app, BrowserWindow } = require('electron')
let win = null

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
    win = new BrowserWindow({
        autoHideMenuBar: true,
        width: 800,
        height: 600,
        icon: 'icons/icon.png'
    })

    win.maximize()
    win.show()

    win.loadURL('https://www.bbc.co.uk/iplayer')
}

app.whenReady().then(() => {
    createWindow()
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

app.on('second-instance', (event, commandLine, workingDirectory) => {
    if (win) {
        if (win.isMinimized()) win.restore()
        win.focus()
    }
})
