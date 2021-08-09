import { ReplicatedStorage, RunService } from "@rbxts/services"

export namespace remoteService {
    let mainListener : RemoteEvent | undefined = undefined
    let sublistener : RemoteFunction | undefined = undefined

    export function load() {
        return true
    }

    if (RunService.IsServer()) {
        let bin = new Instance("Folder")
        bin.Name = "@remoteService.bin"
        bin.Parent = ReplicatedStorage

        mainListener = new Instance("RemoteEvent")
        mainListener.Name = "@remoteService.listener"
        mainListener.Parent = bin

        sublistener = new Instance("RemoteFunction")
        sublistener.Name = "@remoteService.listener2"
        sublistener.Parent = bin

        mainListener.OnServerEvent.Connect((client : Player, ...args : unknown[]) => {
            let event = args[0] as string
            (args as any[]).shift()
            listeners.forEach((e) => {
                if (e.event === event) {
                    e.callback(client, ...args)
                }
            })
        })

        sublistener.OnServerInvoke = (client : Player, ...args : unknown[]) => {
            let event = args[0] as string
            let n
            (args as any[]).shift()
            listeners.forEach((e) => {
                if (e.event === event) {
                    n = e.callback(client, ...args)
                    return n
                }
            })
            return n
        }
    }
    let events : string[] = []
    type callerType = {
        callback : (...data : any[]) => void
        event : string
        disconnect : () => void
    }
    let listeners : callerType[] = []

    export function publishAsync(event : string, ...data : unknown[]) {
        let remote = ReplicatedStorage.FindFirstChild("@remoteService.bin")?.FindFirstChild("@remoteService.listener") as RemoteEvent
        remote.FireServer(event, ...data)
    }
    export function requestAsync(event : string, ...data: unknown[]) {
        let remote = ReplicatedStorage.FindFirstChild("@remoteService.bin")?.FindFirstChild("@remoteService.listener2") as RemoteFunction
        return new Promise((resolve, reject) => {
            let _data = remote.InvokeServer(event, ...data)
            resolve(_data)
        })
    }
    export function listenAsync(event : string, callback : (...data : any[]) => void | any[]) {
        if (events.indexOf(event) !== -1) throw 'event already exists and is being listened for'
        let caller = {
            callback : callback,
            event : event,
            disconnect : () => {
                listeners.remove(listeners.indexOf(caller))
            }
        }
        listeners.push(caller)
        return caller
    }
}

export namespace console {

    type cb = {
        callback : (s : string) => any,
        once : boolean
    }

    let _events : {[key : string] : cb[]} = {
        stdout : []
    }
    
    export function on(event : string, callback : any) {
        let lm = {
            callback : callback,
            once : false
        }
        if (_events.stdout) {
            _events.stdout.push(lm)
        }
    }
    let _stdout = function(s : string) {
        _events.stdout.forEach((value, index) => {
            coroutine.wrap(() => {
                value.callback(s)
            })()
        })
    }
    export function raise(...parameters : any[]) {
        let tp : string[] = []
        parameters.forEach((value, index) => {
            let text : unknown = value
            if (type(value) === "string" || type(value) === "number" || type(value) === "boolean") {
                tp.push(value)
            }
            else {
                
            }
        })
        let embed = false
        for (let i=0; i < 5; i++) {
            let z = debug.info(i, "f")
            _events.stdout.forEach((value) => {
                if (value.callback === z[0]) {
                    embed = true
                }
            })
        }
        if (!embed) {
            _stdout(tp.join(' '))
        }
        error(tp.join(' '))
    }
    export function log(...parameters : any[]) {
        let tp : string[] = []
        parameters.forEach((value, index) => {
            let text : unknown = value
            if (type(value) === "string" || type(value) === "number" || type(value) === "boolean") {
                tp.push(value)
            }
            else {
                
            }
            
        })
        print(tp.join(' '))
        let embed = false
        for (let i=0; i < 5; i++) {
            let z = debug.info(i, "f")
            _events.stdout.forEach((value) => {
                if (value.callback === z[0]) {
                    embed = true
                }
            })
        }
        if (!embed) {
            _stdout(tp.join(' '))
        }
    }
}