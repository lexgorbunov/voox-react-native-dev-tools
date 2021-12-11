//
//  DevToolsViewController.swift
//  DevTools
//
//  Created by Sergei Golishnikov on 09/12/2021.
//  Copyright © 2021 Facebook. All rights reserved.
//

import Foundation
import UIKit


var topPresentingController: UIViewController {
    return UIApplication.shared.keyWindow!.rootViewController!.topViewController()
}



@objc public protocol DrawPathViewDelegate {
    /// Triggered when user just started  drawing
    @objc optional func viewDrawStartedDrawing()
    /// Triggered when user just finished  drawing
    @objc optional func viewDrawEndedDrawing()
}

open class DrawPathView: UIView {

    /// A counter to determine if there are enough points to make a quadcurve
    fileprivate var ctr = 0
    
    fileprivate weak var parent: DevToolsViewController?

    /// The path to stroke
    fileprivate var path : UIBezierPath?

    /// After the user lifts their finger and the line has been finished the same line is rendered to an image and the UIBezierPath is cleared to prevent performance degradation when lots of lines are on screen
    fileprivate var incrementalImage : UIImage?

    /// Initial Image If user needs to draw lines on image firstly
    fileprivate var initialImage : UIImage?

    /// This array stores the points that make each line
    fileprivate lazy var pts = Array<CGPoint?>(repeating: nil, count: 5)

    open var delegate : DrawPathViewDelegate?

    /// Stroke color of drawing path, default is red.
    fileprivate var strokeColor = UIColor.red

    /// Stores all ımages to get back to last - 1 image. Becase erase last needs this :)
    fileprivate var allImages = Array<UIImage>()

    public var lineWidth: CGFloat = 2.0 {

        didSet {
            createPath()
        }
    }


    // MARK: - Initialize -

    required public init(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder)!

        self.isMultipleTouchEnabled = true
        self.backgroundColor = UIColor.clear
        createPath()
    }

    required override public init(frame: CGRect) {
        super.init(frame: frame)
        self.isMultipleTouchEnabled = true
        self.backgroundColor = UIColor.clear
        createPath()
    }

    public init(initialImage: UIImage) {
        self.init()
        self.incrementalImage = initialImage
        self.initialImage = initialImage;
        self.isMultipleTouchEnabled = true
        self.backgroundColor = UIColor.clear
        if let img = incrementalImage {
            img.draw(in: self.bounds)
        }
        createPath()
    }

    // MARK: - Setup -

    fileprivate func createPath() {
        path = nil
        path = UIBezierPath()
        path!.lineWidth = lineWidth
    }

    /// Erases All paths
    open func clearAll() {
        allImages.removeAll()
        ctr = 0
        path?.removeAllPoints()
        path = nil
        incrementalImage = initialImage
        createPath()
        setNeedsDisplay()
    }

    /// Erases Last Path
    open func clearLast() {
        if allImages.count == 0 {
            return
        }
        ctr = 0
        path?.removeAllPoints()
        path = nil
        allImages.removeLast()
        incrementalImage = allImages.last
        createPath()
        setNeedsDisplay()
    }

    // MARK: - Change Stroke Color -

    open func changeStrokeColor(_ color:UIColor!) {
        strokeColor = color
    }

    // MARK: - Draw Method -

    override open func draw(_ rect: CGRect) {
        if let img = incrementalImage {
            img.draw(in: rect)
            strokeColor.setStroke()
            if let pth = path {
                pth.stroke()
            }
        }
    }

    // MARK: - Touch Events -

    override open func touchesBegan(_ touches: Set<UITouch>, with event: UIEvent?) {
        self.parent?.presentationController?.presentedView?.gestureRecognizers?[0].isEnabled = false
        delegate?.viewDrawStartedDrawing?()

        ctr = 0
        let touch =  touches.first
        let p = (touch?.location(in: self))!
        pts[0] = p
        if let pth = path {
            pth.move(to: p)
        }
        drawBitmap(false)
    }

    override open func touchesMoved(_ touches: Set<UITouch>, with event: UIEvent?) {

        let touch =  touches.first
        let p = (touch?.location(in: self))!
        ctr += 1
        pts[ctr] = p

        if ctr == 4 {
            // move the endpoint to the middle of the line joining the second control point of the first Bezier segment and the first control point of the second Bezier segment
            pts[3] = CGPoint(x: (pts[2]!.x + pts[4]!.x)/2.0, y: (pts[2]!.y + pts[4]!.y)/2.0)
            if let pth = path {
                pth.move(to: pts[0]!)
                pth.addCurve(to: pts[3]!, controlPoint1: pts[1]!, controlPoint2: pts[2]!)
            }
            setNeedsDisplay()
            pts[0] = pts[3]
            pts[1] = pts[4]
            ctr = 1
        }
    }

    override open func touchesCancelled(_ touches: Set<UITouch>, with event: UIEvent?) {
        touchesEnded(touches, with: event)
    }

    override open func touchesEnded(_ touches: Set<UITouch>, with event: UIEvent?) {
        self.parent?.presentationController?.presentedView?.gestureRecognizers?[0].isEnabled = true
        delegate?.viewDrawEndedDrawing?()
        drawBitmap(true)
        setNeedsDisplay()
        if let pth = path {
            pth.removeAllPoints()
        }
        ctr = 0
    }

    // MARK: - Bitmap -

    fileprivate func drawBitmap(_ endDrawing:Bool) {
        UIGraphicsBeginImageContextWithOptions(self.bounds.size, true, 0.0)
        draw(self.bounds)
        if let pth = path {
            pth.stroke()
        }
        incrementalImage = UIGraphicsGetImageFromCurrentImageContext()
        if endDrawing {
            if let _ = incrementalImage {
                allImages.append(incrementalImage!)
            }
        }
        UIGraphicsEndImageContext()
    }
}

class TextField: UITextField {

    let padding = UIEdgeInsets(top: 0, left: 8, bottom: 0, right: 8)

    override open func textRect(forBounds bounds: CGRect) -> CGRect {
        return bounds.inset(by: padding)
    }

    override open func placeholderRect(forBounds bounds: CGRect) -> CGRect {
        return bounds.inset(by: padding)
    }

    override open func editingRect(forBounds bounds: CGRect) -> CGRect {
        return bounds.inset(by: padding)
    }
}


class DevToolsViewController: UIViewController {

    var previewScreenShot: UIImageView = {
        let view = UIImageView()
        view.contentMode = .center
        view.clipsToBounds = true
        return view
    }()

    let tempImageView = DrawPathView()
    
    let borderColor = UIColor(red: 238 / 255.0, green: 238 / 255.0, blue: 239 / 255.0, alpha: 1.0)
    lazy var tokenInput: UITextField = {
        let v = TextField()
        v.placeholder = "Token"
        v.layer.cornerRadius = 8
        v.layer.borderWidth = 1
        v.layer.borderColor = borderColor.cgColor
        
        return v
    }()
    
    lazy var projectInput: UITextField = {
        let v = TextField()
        v.placeholder = "Project (MON)"
        v.layer.cornerRadius = 8
        v.layer.borderWidth = 1
        v.layer.borderColor = borderColor.cgColor
        
        return v
    }()
    
    lazy var summaryInput: UITextView = {
        let v = UITextView()
        v.layer.cornerRadius = 8
        v.layer.borderWidth = 1
        v.layer.borderColor = borderColor.cgColor
        v.contentInset = .init(top: 8, left: 8, bottom: 8, right: 8)
        
        return v
    }()


    lazy var sendDataButton: UIButton = {
        let view = UIButton()
        view.setTitle("Send data", for: .normal)
        view.setTitleColor(.white, for: .normal)
        view.addTarget(self, action: #selector(editTapped), for: .touchUpInside)
        view.backgroundColor = UIColor(red: 18 / 255.0, green: 18 / 255.0, blue: 18 / 255.0, alpha: 1)
        view.layer.cornerRadius = 12
        return view
    }()

    static var screenShot: UIImage?
    static var resolve: RCTPromiseResolveBlock?
    static var didResolveUse = false

    static func presentDevController(
        _ resolve: @escaping RCTPromiseResolveBlock
    ) {
        Self.didResolveUse = false
        Self.resolve = resolve
        DispatchQueue.main.async {
            Self.screenShot = createScreenshot()
            let controller = DevToolsViewController()
            controller.modalPresentationStyle = .formSheet
            topPresentingController.present(controller, animated: true)
        }
    }


    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .white
        view.addSubview(previewScreenShot)
        view.addSubview(tempImageView)
        previewScreenShot.image = Self.screenShot
        tempImageView.incrementalImage = Self.screenShot
        tempImageView.parent = self
        view.addSubview(sendDataButton)
        view.addSubview(tokenInput)
        view.addSubview(projectInput)
        view.addSubview(summaryInput)
    }


    @objc
    func editTapped() {
        debugPrint("send data")
        Self.didResolveUse = true
        let image = self.tempImageView.incrementalImage!
        
        DispatchQueue.global(qos: .utility).async {
            let cacheDir = FileManager.default.urls(for: .cachesDirectory, in: .userDomainMask).first!
            let screenhotUrl = cacheDir.appendingPathComponent("screenshot.jpg")
            let screenshotFile = screenhotUrl.absoluteString.replacingOccurrences(of: "file:///", with: "/")
            let didCreate = FileManager.default.createFile(
                atPath: screenshotFile,
                contents: image.jpegData(compressionQuality: 1),
                attributes: nil
            )
            let logFile = Logger.logFilePath.absoluteString.replacingOccurrences(of: "file:///", with: "/")
            Self.resolve?(["logFilePath": logFile, "screenshotPath": didCreate ? screenshotFile : nil])
        }
        self.dismiss(animated: true)
    }

    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        previewScreenShot.frame = .init(
            x: 16,
            y: 16,
            width: 100,
            height: 200
        )
        tempImageView.frame = previewScreenShot.frame
        tempImageView.layer.cornerRadius = 12
        tempImageView.clipsToBounds = true
        previewScreenShot.layer.cornerRadius = 12

        let x = previewScreenShot.frame.maxX + 16
        tokenInput.frame = .init(
            x: x,
            y: 16,
            width: view.frame.width - x - 16,
            height: 48
        )
        
        projectInput.frame = .init(
            x: x,
            y: tokenInput.frame.maxY + 16,
            width: view.frame.width - x - 16,
            height: 48
        )
        
        
        summaryInput.frame = .init(
            x: 16,
            y: previewScreenShot.frame.maxY + 16,
            width: view.frame.width - 32,
            height: 100
        )
        
        
        sendDataButton.frame = .init(
            x: 16,
            y: view.frame.height - view.safeAreaInsets.bottom - 56,
            width: view.frame.width - 32,
            height: 56
        )
    }

    deinit {
        debugPrint("Deinit")
        if !Self.didResolveUse { Self.resolve?(nil) }
        Self.screenShot = nil
        Self.resolve = nil
    }
}


extension UIViewController {

    func topViewController() -> UIViewController {
        topViewController(rootViewController: self)
    }

    func topViewController(rootViewController: UIViewController) -> UIViewController {

        guard let pvc = rootViewController.presentedViewController else {
            return rootViewController
        }

        if let nvc = pvc as? UINavigationController {
            return topViewController(rootViewController: nvc.topViewController!)
        }

        return topViewController(rootViewController: pvc)
    }
}

func createScreenshot() -> UIImage {
    let layer = UIApplication.shared.keyWindow!.layer
    let scale = UIScreen.main.scale
    // Creates UIImage of same size as view
    UIGraphicsBeginImageContextWithOptions(layer.frame.size, false, scale);
    layer.render(in: UIGraphicsGetCurrentContext()!)
    let screenshot = UIGraphicsGetImageFromCurrentImageContext()
    UIGraphicsEndImageContext()
    return screenshot!
}
