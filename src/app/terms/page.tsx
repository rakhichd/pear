'use client';

import Link from "next/link";
import { DocumentTextIcon, ScaleIcon, ShieldCheckIcon, InformationCircleIcon } from "@heroicons/react/24/outline";

export default function TermsOfServicePage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-indigo-600 text-white">
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
            <p className="text-xl text-indigo-100">
              Guidelines for using ResumeFind's services
            </p>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-8 mb-6 border-b border-gray-100 flex flex-col md:flex-row gap-6 items-center">
            <div className="bg-indigo-100 p-4 rounded-full">
              <ScaleIcon className="h-12 w-12 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Terms of Service Agreement
              </h2>
              <p className="text-gray-600">
                Last updated: April 26, 2024
              </p>
            </div>
          </div>
          
          <div className="p-8">
            <div className="prose max-w-none">
              <p>
                Welcome to ResumeFind. These Terms of Service ("Terms") govern your access to and use of the ResumeFind website, services, and applications (collectively, the "Service"). By accessing or using the Service, you agree to be bound by these Terms. If you do not agree to these Terms, you may not access or use the Service.
              </p>
              
              <h3>1. Account Registration</h3>
              
              <p>
                To access certain features of the Service, you may need to register for an account. When you register, you must provide accurate and complete information. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
              </p>
              
              <h3>2. Content</h3>
              
              <h4>2.1 User Content</h4>
              
              <p>
                When you upload, submit, or otherwise provide content to the Service, such as resumes ("User Content"), you grant us a non-exclusive, worldwide, royalty-free, sublicensable, and transferable license to use, reproduce, modify, adapt, publish, translate, create derivative works from, distribute, and display such User Content in connection with operating and providing the Service.
              </p>
              
              <h4>2.2 Content Restrictions</h4>
              
              <p>
                You may not upload, submit, or otherwise provide any User Content that:
              </p>
              
              <ul>
                <li>Infringes any third-party rights, including intellectual property rights</li>
                <li>Contains false, misleading, or deceptive information</li>
                <li>Contains personal or sensitive information about others without their consent</li>
                <li>Violates any applicable law or regulation</li>
                <li>Contains viruses, malware, or other harmful code</li>
                <li>Is obscene, defamatory, threatening, or otherwise objectionable</li>
              </ul>
              
              <h3>3. Use of the Service</h3>
              
              <h4>3.1 Permitted Use</h4>
              
              <p>
                You may use the Service only for lawful purposes and in accordance with these Terms. You may not use the Service:
              </p>
              
              <ul>
                <li>To violate any applicable law or regulation</li>
                <li>To impersonate any person or entity</li>
                <li>To engage in any conduct that restricts or inhibits anyone's use or enjoyment of the Service</li>
                <li>To attempt to gain unauthorized access to the Service, other accounts, or computer systems</li>
                <li>To engage in any automated use of the Service, such as scraping or data mining</li>
              </ul>
              
              <h4>3.2 Service Modifications</h4>
              
              <p>
                We reserve the right to modify, suspend, or discontinue the Service, in whole or in part, at any time, with or without notice to you. We shall not be liable to you or any third party for any modification, suspension, or discontinuation of the Service.
              </p>
              
              <h3>4. Privacy</h3>
              
              <p>
                Our Privacy Policy governs our collection and use of your personal information. By using the Service, you consent to the collection and use of your information as described in our Privacy Policy.
              </p>
              
              <h3>5. Intellectual Property</h3>
              
              <h4>5.1 Our Intellectual Property</h4>
              
              <p>
                The Service and its original content, features, and functionality are owned by ResumeFind and are protected by copyright, trademark, and other intellectual property laws. You may not reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, republish, download, store, or transmit any material from the Service, except as permitted by these Terms.
              </p>
              
              <h4>5.2 Feedback</h4>
              
              <p>
                If you provide us with any feedback or suggestions regarding the Service ("Feedback"), you grant us an unlimited, irrevocable, perpetual, sublicensable, transferable, royalty-free license to use such Feedback for any purpose, including to improve and enhance the Service.
              </p>
              
              <h3>6. Disclaimer of Warranties</h3>
              
              <p>
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE," WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, OR COURSE OF PERFORMANCE.
              </p>
              
              <p>
                WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE, THAT DEFECTS WILL BE CORRECTED, OR THAT THE SERVICE IS FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS.
              </p>
              
              <h3>7. Limitation of Liability</h3>
              
              <p>
                IN NO EVENT SHALL RESUMEFIND, ITS DIRECTORS, EMPLOYEES, PARTNERS, AGENTS, SUPPLIERS, OR AFFILIATES BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM:
              </p>
              
              <ul>
                <li>Your access to or use of or inability to access or use the Service</li>
                <li>Any conduct or content of any third party on the Service</li>
                <li>Any content obtained from the Service</li>
                <li>Unauthorized access, use, or alteration of your transmissions or content</li>
              </ul>
              
              <h3>8. Indemnification</h3>
              
              <p>
                You agree to indemnify and hold harmless ResumeFind and its officers, directors, employees, agents, and affiliates, from and against any and all claims, damages, obligations, losses, liabilities, costs or debt, and expenses (including but not limited to attorney's fees) arising from:
              </p>
              
              <ul>
                <li>Your access to and use of the Service</li>
                <li>Your violation of any term of these Terms</li>
                <li>Your violation of any third-party right, including without limitation any copyright, property, or privacy right</li>
                <li>Any claim that your User Content caused damage to a third party</li>
              </ul>
              
              <h3>9. Termination</h3>
              
              <p>
                We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach these Terms.
              </p>
              
              <p>
                Upon termination, your right to use the Service will immediately cease. If you wish to terminate your account, you may simply discontinue using the Service or contact us to request account deletion.
              </p>
              
              <h3>10. Governing Law</h3>
              
              <p>
                These Terms shall be governed by and construed in accordance with the laws of the State of California, without regard to its conflict of law provisions.
              </p>
              
              <h3>11. Changes to Terms</h3>
              
              <p>
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide notice of any changes by posting the new Terms on this page and updating the "Last updated" date. You are advised to review these Terms periodically for any changes.
              </p>
              
              <h3>12. Contact Us</h3>
              
              <p>
                If you have any questions about these Terms, please contact us at terms@resumefind.com.
              </p>
            </div>
          </div>
        </div>
        
        {/* Summary Boxes */}
        <div className="max-w-4xl mx-auto mt-12 grid md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mr-4">
                <DocumentTextIcon className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold">Key Takeaways</h3>
            </div>
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="text-indigo-600 mr-2">•</span>
                <span className="text-gray-600">You are responsible for the content you upload</span>
              </li>
              <li className="flex items-start">
                <span className="text-indigo-600 mr-2">•</span>
                <span className="text-gray-600">We protect your privacy according to our Privacy Policy</span>
              </li>
              <li className="flex items-start">
                <span className="text-indigo-600 mr-2">•</span>
                <span className="text-gray-600">You may not misuse our Service or violate others' rights</span>
              </li>
              <li className="flex items-start">
                <span className="text-indigo-600 mr-2">•</span>
                <span className="text-gray-600">We may terminate accounts that violate these Terms</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mr-4">
                <InformationCircleIcon className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold">Additional Resources</h3>
            </div>
            <ul className="space-y-3">
              <li>
                <Link href="/privacy" className="text-indigo-600 hover:text-indigo-800 flex items-center">
                  <ShieldCheckIcon className="h-5 w-5 mr-2" />
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-indigo-600 hover:text-indigo-800 flex items-center">
                  <DocumentTextIcon className="h-5 w-5 mr-2" />
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link href="/copyright" className="text-indigo-600 hover:text-indigo-800 flex items-center">
                  <ScaleIcon className="h-5 w-5 mr-2" />
                  Copyright Policy
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-indigo-600 hover:text-indigo-800 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        {/* CTA */}
        <div className="max-w-4xl mx-auto mt-12 text-center">
          <p className="text-gray-600 mb-6">
            By using our Service, you agree to these Terms of Service and our Privacy Policy.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              href="/" 
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition shadow-md"
            >
              Return to Home
            </Link>
            <Link 
              href="/contact" 
              className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition shadow-sm"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}