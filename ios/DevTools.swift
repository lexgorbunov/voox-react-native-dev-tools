import UIKit
import React

@objc(DevTools)
class DevTools: RCTEventEmitter {
    
    override class func requiresMainQueueSetup() -> Bool {
        return false
    }
    
    override func supportedEvents() -> [String]! {
        return ["DevToolsData"]
    }
    
    @objc
    func enableShaker(_ enabled: Bool) {
        //sendEvent(withName: "DevToolsData", body: [])
    }
    
    @objc
    func presentDevTools(
        _ resolve: @escaping RCTPromiseResolveBlock,
        reject: RCTPromiseRejectBlock
    ) {
        DevToolsViewController.presentDevController(resolve)
    }

    @objc
    func screenshot(
        _ resolve: @escaping RCTPromiseResolveBlock,
        reject: RCTPromiseRejectBlock
    ) {
        DispatchQueue.main.async {
            let layer = UIApplication.shared.keyWindow!.layer
            let scale = UIScreen.main.scale
            // Creates UIImage of same size as view
            UIGraphicsBeginImageContextWithOptions(layer.frame.size, false, scale);
            layer.render(in: UIGraphicsGetCurrentContext()!)
            let screenshot = UIGraphicsGetImageFromCurrentImageContext()
            UIGraphicsEndImageContext()
            DispatchQueue.global(qos: .utility).async {
                let imageData = screenshot!.pngData()
                resolve(imageData!.base64EncodedString())
            }
        }
    }
}
