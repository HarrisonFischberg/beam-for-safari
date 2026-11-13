//
//  SafariWebExtensionHandler.swift
//  Beam Extension
//
//  Created by Harrison Fischberg on 10/31/26.
//

import SafariServices

// Beam sends no native messages (the manifest has no nativeMessaging permission), so there is nothing to answer.
class SafariWebExtensionHandler: NSObject, NSExtensionRequestHandling {

    func beginRequest(with context: NSExtensionContext) {
        context.completeRequest(returningItems: nil, completionHandler: nil)
    }

}
