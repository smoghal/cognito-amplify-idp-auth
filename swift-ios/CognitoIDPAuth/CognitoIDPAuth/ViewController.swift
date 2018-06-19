//
//  ViewController.swift
//  CognitoIDPAuth
//

import UIKit
import AWSCognitoAuth

class ViewController: UIViewController, AWSCognitoAuthDelegate {
    @IBOutlet weak var signInButton: UIBarButtonItem!
    @IBOutlet weak var signOutButton: UIBarButtonItem!
    @IBOutlet weak var logText: UITextView!
    
    var auth: AWSCognitoAuth = AWSCognitoAuth.default()
    var session: AWSCognitoAuthUserSession?
    var firstLoad: Bool = true
    var signedIn: Bool = false
    
    // implement AWSCognitoAuthDelegate protocol requirement
    func getViewController() -> UIViewController {
        return self;
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        // Do any additional setup after loading the view, typically from a nib.
        
        // clean up the text area
        self.logText.text = ""
        
        // check Cognito settings
        self.auth.delegate = self;
        if(self.auth.authConfiguration.appClientId.contains("SETME")){
            self.debugMessage(message: "Info.plist missing necessary config under AWS->CognitoUserPool->Default")
            self.showAlertMessage("Error", message: "Info.plist missing necessary config under AWS->CognitoUserPool->Default")
        }
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        if(self.firstLoad){
            self.signInButtonAction(signInButton)
        }
        self.firstLoad = false
    }
    
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    func showAlertMessage(_ title:String, message:String?) -> Void {
        DispatchQueue.main.async {
            let alert = UIAlertController(title: title, message: message, preferredStyle: UIAlertControllerStyle.alert)
            let action = UIAlertAction(title: "Ok", style: UIAlertActionStyle.default) { (UIAlertAction) in
                alert.dismiss(animated: false, completion: nil)
            }
            alert.addAction(action)
            self.present(alert, animated: true, completion: nil)
        }
    }
    
    func debugMessage(message: String) {
        print(message)
        // execute UI stuff on the main thread
        DispatchQueue.main.async(execute: {
            self.logText.text.append("\n")
            let logMessage = message
            self.logText.text.append(logMessage)
        })
    }
    
    @IBAction func signInButtonAction(_ sender: UIBarButtonItem) {
        self.debugMessage(message: "Signin button clicked")
        self.auth.getSession  { (session:AWSCognitoAuthUserSession?, error:Error?) in
            if(error != nil) {
                self.session = nil
                self.debugMessage(message: (error! as NSError).userInfo["error"] as! String)
                self.showAlertMessage("Error", message: (error! as NSError).userInfo["error"] as? String)
            } else {
                self.session = session
                self.debugMessage(message: "Successfully signed in")
                self.signedIn = true
            }
            //self.refresh()
            //dump contents of session in a text view
        }
    }
    
    @IBAction func signOutButtonAction(_ sender: UIBarButtonItem) {
        self.debugMessage(message: "Signout button clicked")
        self.auth.signOut { (error:Error?) in
            if(error != nil){
                self.debugMessage(message: (error! as NSError).userInfo["error"] as! String)
                self.showAlertMessage("Error", message: (error! as NSError).userInfo["error"] as? String)
            } else {
                self.session = nil
                self.debugMessage(message: "Session completed successfully")
                self.signedIn = false
            }
            //self.refresh()
            //dump contents of session in a text view
        }
    }

    @IBAction func clearButtonAction(_ sender: UIBarButtonItem) {
        // clean up the text area
        self.logText.text = ""
    }
    
    @IBAction func showSessionButtonAction(_ sender: UIBarButtonItem) {
        
        if (!self.signedIn) {
            self.debugMessage(message: "User is not signed in" )
            return
        }
        
        self.auth.getSession  { (session:AWSCognitoAuthUserSession?, error:Error?) in
            if(error != nil) {
                self.debugMessage(message: (error! as NSError).userInfo["error"] as! String)
            } else {
                self.session = session
                
                // dump session info
                self.debugMessage(message: "============================" )
                self.debugMessage(message: "User name:" )
                self.debugMessage(message: session!.username! )
                
                self.debugMessage(message: "============================" )
                self.debugMessage(message: "Access Token Claim info:" )
                self.debugMessage(message: "    claim count: " + session!.accessToken!.claims.count.description)
                for (key, value) in session!.accessToken!.claims {
                    print(value)
                    let val = value as? String ?? ""
                    self.debugMessage(message: "    " + key.description + ": " + val )
                }
                self.debugMessage(message: "\n" )
                
                self.debugMessage(message: "ID Token Claim info:" )
                self.debugMessage(message: "    claim count: " + session!.idToken!.claims.count.description)
                for (key, value) in session!.idToken!.claims {
                    print(value)
                    let val = value as? String ?? ""
                    self.debugMessage(message: "    " + key.description + ": " + val )
                }
                self.debugMessage(message: "\n" )
                
                self.debugMessage(message: "Referh Token Claim info:" )
                self.debugMessage(message: "    claim count: " + session!.refreshToken!.claims.count.description)
                for (key, value) in session!.refreshToken!.claims {
                    print(value)
                    let val = value as? String ?? ""
                    self.debugMessage(message: "    " + key.description + ": " + val )
                }
            }
        }
    }
    
    @IBAction func showTokensButtonAction(_ sender: UIBarButtonItem) {
        if (!self.signedIn) {
            self.debugMessage(message: "User is not signed in" )
            return
        }
        
        self.auth.getSession  { (session:AWSCognitoAuthUserSession?, error:Error?) in
            if(error != nil) {
                self.debugMessage(message: (error! as NSError).userInfo["error"] as! String)
            } else {
                self.debugMessage(message: "============================" )
                self.debugMessage(message: "Access Token:" )
                self.debugMessage(message: session!.accessToken!.tokenString)
                
                self.debugMessage(message: "============================" )
                self.debugMessage(message: "ID Token:" )
                self.debugMessage(message: session!.idToken!.tokenString)
                
                self.debugMessage(message: "============================" )
                self.debugMessage(message: "Refresh Token:" )
                self.debugMessage(message: session!.refreshToken!.tokenString)
                
                self.debugMessage(message: "============================" )
            }
        }
    }
    

}

