import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — intelliDocs",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-rose-100 to-teal-100">
      <div className="max-w-3xl mx-auto px-6 py-12">

        {/* Header */}
        <Link href="/" className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 rounded-lg overflow-hidden bg-white shadow-sm flex items-center justify-center">
            <Image src="/Logo.svg" alt="intelliDocs" width={26} height={26} className="object-contain" />
          </div>
          <span className="font-bold text-gray-800 tracking-tight">intelliDocs</span>
        </Link>

        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-sm border border-white/80">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-sm text-gray-500 mb-8">Last updated: March 2026</p>

          <div className="space-y-7 text-gray-700 text-sm leading-relaxed">

            <section>
              <h2 className="text-base font-semibold text-gray-900 mb-2">1. Introduction</h2>
              <p>intelliDocs (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our AI-powered document chat service. By using intelliDocs, you agree to the practices described in this policy.</p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-900 mb-2">2. Information We Collect</h2>
              <p className="mb-2">We collect the following types of information:</p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li><span className="font-medium text-gray-800">Account information:</span> Name, email address, and authentication data provided through Clerk.</li>
                <li><span className="font-medium text-gray-800">Uploaded documents:</span> PDF files you upload to use with the Service, stored securely on AWS S3.</li>
                <li><span className="font-medium text-gray-800">Chat history:</span> Conversations you have with the AI about your documents, stored in our database.</li>
                <li><span className="font-medium text-gray-800">Usage data:</span> Interactions with the Service, including features accessed and actions taken.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-900 mb-2">3. How We Use Your Information</h2>
              <p className="mb-2">We use the information we collect to:</p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>Provide, operate, and maintain the Service</li>
                <li>Process your uploaded documents and generate AI responses</li>
                <li>Authenticate your identity and manage your account</li>
                <li>Improve and personalize your experience</li>
                <li>Respond to your support requests or inquiries</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-900 mb-2">4. Document Storage and Processing</h2>
              <p>Documents you upload are stored securely on AWS S3. Document content is processed through our AI pipeline — which includes text extraction, embedding generation via OpenAI, and vector storage via Pinecone — solely to power the chat functionality. We do not use your document content to train AI models or share it with third parties beyond what is necessary to operate the Service.</p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-900 mb-2">5. Third-Party Services</h2>
              <p className="mb-2">intelliDocs relies on the following third-party services, each governed by their own privacy policies:</p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li><span className="font-medium text-gray-800">Clerk</span> — authentication and user management</li>
                <li><span className="font-medium text-gray-800">AWS S3</span> — document file storage</li>
                <li><span className="font-medium text-gray-800">OpenAI</span> — AI response generation and embeddings</li>
                <li><span className="font-medium text-gray-800">Pinecone</span> — vector database for document search</li>
                <li><span className="font-medium text-gray-800">Neon (PostgreSQL)</span> — chat and metadata storage</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-900 mb-2">6. Data Retention</h2>
              <p>Your documents, chat history, and account data are retained as long as your account is active or as needed to provide the Service. You may delete individual chats and their associated documents at any time through the Service interface. Upon account deletion, your data will be removed from our systems within a reasonable timeframe.</p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-900 mb-2">7. Data Security</h2>
              <p>We implement industry-standard security measures to protect your data, including encrypted connections (HTTPS), secure cloud storage, and authenticated API access. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.</p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-900 mb-2">8. Your Rights</h2>
              <p className="mb-2">Depending on your location, you may have the right to:</p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>Access the personal data we hold about you</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Object to or restrict certain processing of your data</li>
              </ul>
              <p className="mt-2">To exercise any of these rights, please contact us at <a href="mailto:vinitrajsingh5555@gmail.com" className="text-blue-600 hover:underline">vinitrajsingh5555@gmail.com</a>.</p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-900 mb-2">9. Cookies</h2>
              <p>intelliDocs uses essential cookies and session tokens required for authentication and core functionality. We do not use tracking or advertising cookies. By using the Service, you consent to the use of these essential cookies.</p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-900 mb-2">10. Children&apos;s Privacy</h2>
              <p>The Service is not directed to children under the age of 13. We do not knowingly collect personal information from children. If you believe we have inadvertently collected such information, please contact us and we will take steps to delete it promptly.</p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-900 mb-2">11. Changes to This Policy</h2>
              <p>We may update this Privacy Policy from time to time. We will notify you of significant changes by updating the date at the top of this page. Continued use of the Service after changes constitutes your acceptance of the revised policy.</p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-900 mb-2">12. Contact</h2>
              <p>If you have any questions or concerns about this Privacy Policy, please contact: <a href="mailto:vinitrajsingh5555@gmail.com" className="text-blue-600 hover:underline">vinitrajsingh5555@gmail.com</a></p>
            </section>

          </div>
        </div>

        <div className="text-center mt-6 text-xs text-gray-500">
          <Link href="/" className="hover:text-gray-700 transition-colors">← Back to intelliDocs</Link>
        </div>
      </div>
    </div>
  );
}
