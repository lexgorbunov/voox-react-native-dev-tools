//
//  DevToolsViewController.swift
//  DevTools
//
//  Created by Sergei Golishnikov on 09/12/2021.
//  Copyright © 2021 Facebook. All rights reserved.
//

import Foundation
import UIKit


class DevToolsViewController: UIViewController {

    var previewScreenShot: UIImageView = {
        let view = UIImageView()
        view.contentMode = .center
        view.clipsToBounds = true
        return view
    }()

    let tempImageView = DrawPathView()
    
    let borderColor = UIColor(
        red: 238 / 255.0,
        green: 238 / 255.0,
        blue: 239 / 255.0,
        alpha: 1.0
    )
    
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
    static var isPresented = false

    static func presentDevController(
        _ resolve: @escaping RCTPromiseResolveBlock
    ) {
        if Self.isPresented { return }
        Self.isPresented = true
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
        view.addSubview(summaryInput)
        
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(keyboardWillShow(sender:)),
            name: UIResponder.keyboardWillShowNotification,
            object: nil
        )
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(keyboardWillHide(sender:)),
            name: UIResponder.keyboardWillHideNotification,
            object: nil
        )
    }
    
    @objc
    func keyboardWillShow(sender: Notification) {
        
        if let keyboardSize = sender.userInfo?[UIResponder.keyboardFrameEndUserInfoKey] as? CGRect {
            self.view.frame.origin.y = -keyboardSize.height
        }
    }
    
    @objc
    func keyboardWillHide(sender: Notification) {
        self.view.frame.origin.y = 0
    }


    @objc
    func editTapped() {
        Self.didResolveUse = true
        let image = self.tempImageView.incrementalImage
        prepareScreenshotAndLogFile(
            screenshot: image,
            summary: summaryInput.text,
            resolve: Self.resolve
        )
        self.dismiss(animated: true)
    }

    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        let aspect = view.frame.width / view.frame.height
        previewScreenShot.frame = .init(
            x: (view.frame.width - (view.frame.width * 0.7)) / 2,
            y: 16,
            width:  view.frame.width * 0.7,
            height: (view.frame.width * 0.7) / aspect
        )
        tempImageView.frame = previewScreenShot.frame
        tempImageView.layer.cornerRadius = 12
        tempImageView.clipsToBounds = true
        previewScreenShot.layer.cornerRadius = 12
        
        let safeArea = view.safeAreaInsets.bottom > 0 ? view.safeAreaInsets.bottom : 16
        sendDataButton.frame = .init(
            x: 16,
            y: view.frame.height - safeArea - 56,
            width: view.frame.width - 32,
            height: 56
        )
        
        let h = (sendDataButton.frame.minY - 16) - (previewScreenShot.frame.maxY + 16)
        summaryInput.frame = .init(
            x: 16,
            y: previewScreenShot.frame.maxY + 16,
            width: view.frame.width - 32,
            height: h
        )
    }

    deinit {
        debugPrint("Deinit")
        NotificationCenter.default.removeObserver(self)
        if !Self.didResolveUse { Self.resolve?(nil) }
        Self.screenShot = nil
        Self.resolve = nil
        Self.isPresented = false
    }
}
