import UIKit

@objc(DevTools)
class DevTools: NSObject {
    let logger = Logger()
    
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
    
    @objc
    func writeLog(
        _ message: String,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        logger.writeLog(message, resolver: resolve, rejecter: reject)
    }
    
    @objc
    func getAllLogs(
        _ resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        logger.getAllLogs(resolver: resolve, rejecter: reject)
    }
    
    @objc
    func deleteLogFile(
        _ resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        //TODO
    }
}
