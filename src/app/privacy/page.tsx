'use client';

import Link from "next/link";
import { ShieldCheckIcon, LockClosedIcon, DocumentTextIcon, FingerPrintIcon } from "@heroicons/react/24/outline";

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-indigo-600 text-white">
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-xl text-indigo-100">
              Your privacy matters to us. Learn how ResumeFind protects your data.
            </p>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-8 mb-6 border-b border-gray-100 flex flex-col md:flex-row gap-6 items-center">
            <div className="bg-indigo-100 p-4 rounded-full">
              <ShieldCheckIcon className="h-12 w-12 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Our Commitment to Your Privacy
              </h2>
              <p className="text-gray-600">
                Last updated: April 26, 2024
              </p>
            </div>
          </div>
          
          <div className="p-8">
            <div className="prose max-w-none">
              <p>
                At ResumeFind, we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect your personal information when you use our services. By accessing or using ResumeFind, you agree to the terms of this Privacy Policy.
              </p>
              
              <h3>Information We Collect</h3>
              
              <p>We collect the following types of information:</p>
              
              <ul>
                <li>
                  <strong>Account Information:</strong> When you create an account, we collect your name, email address, and authentication information.
                </li>
                <li>
                  <strong>Resume Data:</strong> When you upload or share your resume, we collect the content and metadata associated with your resume.
                </li>
                <li>
                  <strong>Usage Information:</strong> We collect information about how you interact with our services, such as the pages you visit, the features you use, and the time you spend on our platform.
                </li>
                <li>
                  <strong>Device Information:</strong> We collect information about the device you use to access our services, including your IP address, browser type, and operating system.
                </li>
              </ul>
              
              <h3>How We Use Your Information</h3>
              
              <p>We use your information for the following purposes:</p>
              
              <ul>
                <li>To provide and improve our services</li>
                <li>To personalize your experience</li>
                <li>To communicate with you about our services</li>
                <li>To analyze usage patterns and optimize our platform</li>
                <li>To ensure the security and integrity of our services</li>
                <li>To comply with legal obligations</li>
              </ul>
              
              <h3>How We Share Your Information</h3>
              
              <p>
                We do not sell your personal information to third parties. We may share your information in the following circumstances:
              </p>
              
              <ul>
                <li>With service providers who help us operate our platform</li>
                <li>With your consent, when you choose to share your resume publicly or with specific users</li>
                <li>To comply with legal requirements, such as court orders or legal processes</li>
                <li>To protect our rights, property, or safety, or the rights, property, or safety of others</li>
              </ul>
              
              <h3>Your Rights and Choices</h3>
              
              <p>
                You have certain rights regarding your personal information, including:
              </p>
              
              <ul>
                <li>The right to access and review your personal information</li>
                <li>The right to correct inaccurate information</li>
                <li>The right to delete your personal information</li>
                <li>The right to restrict or object to processing</li>
                <li>The right to data portability</li>
              </ul>
              
              <p>
                To exercise these rights, please contact us at privacy@resumefind.com.
              </p>
              
              <h3>Data Security</h3>
              
              <p>
                We implement appropriate technical and organizational measures to protect your personal information from unauthorized access, disclosure, alteration, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure, so we cannot guarantee absolute security.
              </p>
              
              <h3>Retention of Information</h3>
              
              <p>
                We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law.
              </p>
              
              <h3>International Data Transfers</h3>
              
              <p>
                Your information may be transferred to and processed in countries other than the country in which you reside. These countries may have different data protection laws than your country. We take steps to ensure that your information receives an adequate level of protection in the countries in which we process it.
              </p>
              
              <h3>Children's Privacy</h3>
              
              <p>
                Our services are not directed to children under the age of 16. We do not knowingly collect personal information from children under 16. If you become aware that a child has provided us with personal information without parental consent, please contact us, and we will take steps to delete such information.
              </p>
              
              <h3>Changes to This Privacy Policy</h3>
              
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.
              </p>
              
              <h3>Contact Us</h3>
              
              <p>
                If you have any questions about this Privacy Policy, please contact us at privacy@resumefind.com.
              </p>
            </div>
          </div>
        </div>
        
        {/* Privacy Features */}
        <div className="max-w-4xl mx-auto mt-12 grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
              <LockClosedIcon className="h-6 w-6 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Data Security</h3>
            <p className="text-gray-600">
              We use industry-standard encryption and security measures to protect your personal information.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
              <FingerPrintIcon className="h-6 w-6 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Privacy Controls</h3>
            <p className="text-gray-600">
              You have control over what information you share and who can see your resume.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
              <DocumentTextIcon className="h-6 w-6 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Transparent Practices</h3>
            <p className="text-gray-600">
              We're committed to clear communication about how we handle your data.
            </p>
          </div>
        </div>
        
        {/* CTA */}
        <div className="max-w-4xl mx-auto mt-12 text-center">
          <p className="text-gray-600 mb-6">
            Have more questions about our privacy practices?
          </p>
          <Link 
            href="/contact" 
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition shadow-md"
          >
            Contact Our Privacy Team
          </Link>
        </div>
      </div>
    </div>
  );
}