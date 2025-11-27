import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";

export const Privacy = () => {
  const { isDark } = useTheme();

  return (
    <div
      className={`min-h-screen ${
        isDark
          ? "bg-gradient-to-br from-[#1a1a1f] via-[#0f0f14] to-[#1a1a1f]"
          : "bg-gradient-to-br from-gray-50 via-white to-gray-50"
      }`}
    >
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <Link
          to="/"
          className={`inline-flex items-center gap-2 mb-6 text-sm transition-colors ${
            isDark
              ? "text-[#B4B4B8] hover:text-white"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div
          className={`rounded-2xl border p-6 md:p-8 ${
            isDark
              ? "bg-[rgba(0,0,0,0.3)] border-[rgba(255,255,255,0.1)]"
              : "bg-white border-gray-200"
          }`}
        >
          <h1
            className={`text-3xl md:text-4xl font-bold mb-2 ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            Privacy Notice
          </h1>
          <p
            className={`text-sm mb-8 ${
              isDark ? "text-[#B4B4B8]" : "text-gray-600"
            }`}
          >
            Last updated: November 16, 2025
          </p>

          <div
            className={`prose prose-sm md:prose-base max-w-none ${
              isDark ? "prose-invert" : ""
            }`}
          >
            <p>
              This Privacy Notice for INTEGRAL LABS LLC ("we," "us," or "our"),
              describes how and why we might access, collect, store, use, and/or
              share ("process") your personal information when you use our
              services ("Services"), including when you:
            </p>

            <ul>
              <li>
                Visit our website at{" "}
                <a
                  href="https://www.integral.integral.com"
                  className="text-[#8B5CF6] hover:underline"
                >
                  https://www.integral.integral.com
                </a>{" "}
                or any website of ours that links to this Privacy Notice
              </li>
              <li>
                Download and use our mobile application (Integral), or any other
                application of ours that links to this Privacy Notice
              </li>
              <li>
                Use Integral. Manage tasks, track time, journal your progress,
                control your budget, and organize notes—all in one beautiful,
                integrated platform.
              </li>
              <li>
                Engage with us in other related ways, including any sales,
                marketing, or events
              </li>
            </ul>

            <p className="font-semibold">Questions or concerns?</p>
            <p>
              Reading this Privacy Notice will help you understand your privacy
              rights and choices. We are responsible for making decisions about
              how your personal information is processed. If you do not agree
              with our policies and practices, please do not use our Services.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">
              Summary of Key Points
            </h2>

            <div
              className={`p-4 rounded-lg mb-6 ${
                isDark ? "bg-[rgba(139,92,246,0.1)]" : "bg-purple-50"
              }`}
            >
              <p className="text-sm italic">
                This summary provides key points from our Privacy Notice, but
                you can find out more details about any of these topics by using
                our table of contents below.
              </p>
            </div>

            <p>
              <strong>What personal information do we process?</strong> When you
              visit, use, or navigate our Services, we may process personal
              information depending on how you interact with us and the
              Services, the choices you make, and the products and features you
              use.
            </p>

            <p>
              <strong>Do we process any sensitive personal information?</strong>{" "}
              We do not process sensitive personal information.
            </p>

            <p>
              <strong>Do we collect any information from third parties?</strong>{" "}
              We do not collect any information from third parties.
            </p>

            <p>
              <strong>How do we process your information?</strong> We process
              your information to provide, improve, and administer our Services,
              communicate with you, for security and fraud prevention, and to
              comply with law. We may also process your information for other
              purposes with your consent. We process your information only when
              we have a valid legal reason to do so.
            </p>

            <p>
              <strong>
                In what situations and with which parties do we share personal
                information?
              </strong>{" "}
              We may share information in specific situations and with specific
              third parties.
            </p>

            <p>
              <strong>What are your rights?</strong> Depending on where you are
              located geographically, the applicable privacy law may mean you
              have certain rights regarding your personal information.
            </p>

            <p>
              <strong>How do you exercise your rights?</strong> The easiest way
              to exercise your rights is by contacting us at{" "}
              <a
                href="mailto:support@integral.com"
                className="text-[#8B5CF6] hover:underline"
              >
                support@integral.com
              </a>
              . We will consider and act upon any request in accordance with
              applicable data protection laws.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">Table of Contents</h2>

            <ol className="space-y-2">
              <li>
                <a
                  href="#info-collect"
                  className="text-[#8B5CF6] hover:underline"
                >
                  1. What Information Do We Collect?
                </a>
              </li>
              <li>
                <a href="#info-use" className="text-[#8B5CF6] hover:underline">
                  2. How Do We Process Your Information?
                </a>
              </li>
              <li>
                <a
                  href="#legal-bases"
                  className="text-[#8B5CF6] hover:underline"
                >
                  3. What Legal Bases Do We Rely On?
                </a>
              </li>
              <li>
                <a href="#who-share" className="text-[#8B5CF6] hover:underline">
                  4. When and With Whom Do We Share Your Information?
                </a>
              </li>
              <li>
                <a href="#cookies" className="text-[#8B5CF6] hover:underline">
                  5. Do We Use Cookies and Other Tracking Technologies?
                </a>
              </li>
              <li>
                <a
                  href="#social-logins"
                  className="text-[#8B5CF6] hover:underline"
                >
                  6. How Do We Handle Your Social Logins?
                </a>
              </li>
              <li>
                <a
                  href="#info-retain"
                  className="text-[#8B5CF6] hover:underline"
                >
                  7. How Long Do We Keep Your Information?
                </a>
              </li>
              <li>
                <a
                  href="#privacy-rights"
                  className="text-[#8B5CF6] hover:underline"
                >
                  8. What Are Your Privacy Rights?
                </a>
              </li>
              <li>
                <a href="#dnt" className="text-[#8B5CF6] hover:underline">
                  9. Controls for Do-Not-Track Features
                </a>
              </li>
              <li>
                <a href="#us-laws" className="text-[#8B5CF6] hover:underline">
                  10. Do United States Residents Have Specific Privacy Rights?
                </a>
              </li>
              <li>
                <a
                  href="#policy-updates"
                  className="text-[#8B5CF6] hover:underline"
                >
                  11. Do We Make Updates to This Notice?
                </a>
              </li>
              <li>
                <a href="#contact" className="text-[#8B5CF6] hover:underline">
                  12. How Can You Contact Us About This Notice?
                </a>
              </li>
              <li>
                <a href="#request" className="text-[#8B5CF6] hover:underline">
                  13. How Can You Review, Update, or Delete Data?
                </a>
              </li>
            </ol>

            <h2 id="info-collect" className="text-2xl font-bold mt-8 mb-4">
              1. What Information Do We Collect?
            </h2>

            <h3 className="text-xl font-semibold mt-6 mb-3">
              Personal Information You Disclose to Us
            </h3>

            <p className="italic">
              In Short: We collect personal information that you provide to us.
            </p>

            <p>
              We collect personal information that you voluntarily provide to us
              when you register on the Services, express an interest in
              obtaining information about us or our products and Services, when
              you participate in activities on the Services, or otherwise when
              you contact us.
            </p>

            <p>
              <strong>Personal Information Provided by You.</strong> The
              personal information that we collect depends on the context of
              your interactions with us and the Services, the choices you make,
              and the products and features you use. The personal information we
              collect may include the following:
            </p>

            <ul>
              <li>Phone numbers</li>
              <li>Email addresses</li>
              <li>Usernames</li>
              <li>Passwords</li>
              <li>Names</li>
              <li>Contact or authentication data</li>
              <li>Billing addresses</li>
              <li>Debit/credit card numbers</li>
            </ul>

            <p>
              <strong>Sensitive Information.</strong> We do not process
              sensitive information.
            </p>

            <p>
              <strong>Social Media Login Data.</strong> We may provide you with
              the option to register with us using your existing social media
              account details, like your Facebook, X, or other social media
              account. If you choose to register in this way, we will collect
              certain profile information about you from the social media
              provider, as described in the section called "How Do We Handle
              Your Social Logins?" below.
            </p>

            <p>
              All personal information that you provide to us must be true,
              complete, and accurate, and you must notify us of any changes to
              such personal information.
            </p>

            <h2 id="info-use" className="text-2xl font-bold mt-8 mb-4">
              2. How Do We Process Your Information?
            </h2>

            <p className="italic">
              In Short: We process your information to provide, improve, and
              administer our Services, communicate with you, for security and
              fraud prevention, and to comply with law.
            </p>

            <p>
              We process your personal information for a variety of reasons,
              depending on how you interact with our Services, including:
            </p>

            <ul>
              <li>
                <strong>
                  To facilitate account creation and authentication and
                  otherwise manage user accounts.
                </strong>{" "}
                We may process your information so you can create and log in to
                your account, as well as keep your account in working order.
              </li>
              <li>
                <strong>
                  To deliver and facilitate delivery of services to the user.
                </strong>{" "}
                We may process your information to provide you with the
                requested service.
              </li>
              <li>
                <strong>
                  To respond to user inquiries/offer support to users.
                </strong>{" "}
                We may process your information to respond to your inquiries and
                solve any potential issues you might have with the requested
                service.
              </li>
              <li>
                <strong>To send administrative information to you.</strong> We
                may process your information to send you details about our
                products and services, changes to our terms and policies, and
                other similar information.
              </li>
              <li>
                <strong>
                  To save or protect an individual's vital interest.
                </strong>{" "}
                We may process your information when necessary to save or
                protect an individual's vital interest, such as to prevent harm.
              </li>
            </ul>

            <h2 id="legal-bases" className="text-2xl font-bold mt-8 mb-4">
              3. What Legal Bases Do We Rely On to Process Your Information?
            </h2>

            <p className="italic">
              In Short: We only process your personal information when we
              believe it is necessary and we have a valid legal reason (i.e.,
              legal basis) to do so under applicable law, like with your
              consent, to comply with laws, to provide you with services to
              enter into or fulfill our contractual obligations, to protect your
              rights, or to fulfill our legitimate business interests.
            </p>

            <h3 className="text-lg font-semibold mt-6 mb-3">
              If you are located in the EU or UK, this section applies to you.
            </h3>

            <p>
              The General Data Protection Regulation (GDPR) and UK GDPR require
              us to explain the valid legal bases we rely on in order to process
              your personal information. As such, we may rely on the following
              legal bases to process your personal information:
            </p>

            <ul>
              <li>
                <strong>Consent.</strong> We may process your information if you
                have given us permission (i.e., consent) to use your personal
                information for a specific purpose. You can withdraw your
                consent at any time.
              </li>
              <li>
                <strong>Performance of a Contract.</strong> We may process your
                personal information when we believe it is necessary to fulfill
                our contractual obligations to you, including providing our
                Services or at your request prior to entering into a contract
                with you.
              </li>
              <li>
                <strong>Legal Obligations.</strong> We may process your
                information where we believe it is necessary for compliance with
                our legal obligations, such as to cooperate with a law
                enforcement body or regulatory agency, exercise or defend our
                legal rights, or disclose your information as evidence in
                litigation in which we are involved.
              </li>
              <li>
                <strong>Vital Interests.</strong> We may process your
                information where we believe it is necessary to protect your
                vital interests or the vital interests of a third party, such as
                situations involving potential threats to the safety of any
                person.
              </li>
            </ul>

            <h3 className="text-lg font-semibold mt-6 mb-3">
              If you are located in Canada, this section applies to you.
            </h3>

            <p>
              We may process your information if you have given us specific
              permission (i.e., express consent) to use your personal
              information for a specific purpose, or in situations where your
              permission can be inferred (i.e., implied consent). You can
              withdraw your consent at any time.
            </p>

            <p>
              In some exceptional cases, we may be legally permitted under
              applicable law to process your information without your consent,
              including, for example:
            </p>

            <ul>
              <li>
                If collection is clearly in the interests of an individual and
                consent cannot be obtained in a timely way
              </li>
              <li>For investigations and fraud detection and prevention</li>
              <li>
                For business transactions provided certain conditions are met
              </li>
              <li>
                If it is contained in a witness statement and the collection is
                necessary to assess, process, or settle an insurance claim
              </li>
              <li>
                For identifying injured, ill, or deceased persons and
                communicating with next of kin
              </li>
              <li>
                If we have reasonable grounds to believe an individual has been,
                is, or may be victim of financial abuse
              </li>
              <li>
                If it is reasonable to expect collection and use with consent
                would compromise the availability or the accuracy of the
                information and the collection is reasonable for purposes
                related to investigating a breach of an agreement or a
                contravention of the laws of Canada or a province
              </li>
              <li>
                If disclosure is required to comply with a subpoena, warrant,
                court order, or rules of the court relating to the production of
                records
              </li>
              <li>
                If it was produced by an individual in the course of their
                employment, business, or profession and the collection is
                consistent with the purposes for which the information was
                produced
              </li>
              <li>
                If the collection is solely for journalistic, artistic, or
                literary purposes
              </li>
              <li>
                If the information is publicly available and is specified by the
                regulations
              </li>
            </ul>

            <h2 id="who-share" className="text-2xl font-bold mt-8 mb-4">
              4. When and With Whom Do We Share Your Personal Information?
            </h2>

            <p className="italic">
              In Short: We may share information in specific situations
              described in this section and/or with the following third parties.
            </p>

            <p>
              We may need to share your personal information in the following
              situations:
            </p>

            <ul>
              <li>
                <strong>Business Transfers.</strong> We may share or transfer
                your information in connection with, or during negotiations of,
                any merger, sale of company assets, financing, or acquisition of
                all or a portion of our business to another company.
              </li>
            </ul>

            <h2 id="cookies" className="text-2xl font-bold mt-8 mb-4">
              5. Do We Use Cookies and Other Tracking Technologies?
            </h2>

            <p className="italic">
              In Short: We may use cookies and other tracking technologies to
              collect and store your information.
            </p>

            <p>
              We may use cookies and similar tracking technologies (like web
              beacons and pixels) to gather information when you interact with
              our Services. Some online tracking technologies help us maintain
              the security of our Services and your account, prevent crashes,
              fix bugs, save your preferences, and assist with basic site
              functions.
            </p>

            <p>
              We also permit third parties and service providers to use online
              tracking technologies on our Services for analytics and
              advertising, including to help manage and display advertisements,
              to tailor advertisements to your interests, or to send abandoned
              shopping cart reminders (depending on your communication
              preferences).
            </p>

            <p>
              To the extent these online tracking technologies are deemed to be
              a "sale"/"sharing" (which includes targeted advertising, as
              defined under the applicable laws) under applicable US state laws,
              you can opt out of these online tracking technologies by
              submitting a request as described below under section "Do United
              States Residents Have Specific Privacy Rights?"
            </p>

            <h2 id="social-logins" className="text-2xl font-bold mt-8 mb-4">
              6. How Do We Handle Your Social Logins?
            </h2>

            <p className="italic">
              In Short: If you choose to register or log in to our Services
              using a social media account, we may have access to certain
              information about you.
            </p>

            <p>
              Our Services offer you the ability to register and log in using
              your third-party social media account details (like your Facebook
              or X logins). Where you choose to do this, we will receive certain
              profile information about you from your social media provider. The
              profile information we receive may vary depending on the social
              media provider concerned, but will often include your name, email
              address, friends list, and profile picture, as well as other
              information you choose to make public on such a social media
              platform.
            </p>

            <p>
              We will use the information we receive only for the purposes that
              are described in this Privacy Notice or that are otherwise made
              clear to you on the relevant Services. Please note that we do not
              control, and are not responsible for, other uses of your personal
              information by your third-party social media provider. We
              recommend that you review their privacy notice to understand how
              they collect, use, and share your personal information, and how
              you can set your privacy preferences on their sites and apps.
            </p>

            <h2 id="info-retain" className="text-2xl font-bold mt-8 mb-4">
              7. How Long Do We Keep Your Information?
            </h2>

            <p className="italic">
              In Short: We keep your information for as long as necessary to
              fulfill the purposes outlined in this Privacy Notice unless
              otherwise required by law.
            </p>

            <p>
              We will only keep your personal information for as long as it is
              necessary for the purposes set out in this Privacy Notice, unless
              a longer retention period is required or permitted by law (such as
              tax, accounting, or other legal requirements).
            </p>

            <p>
              When we have no ongoing legitimate business need to process your
              personal information, we will either delete or anonymize such
              information, or, if this is not possible (for example, because
              your personal information has been stored in backup archives),
              then we will securely store your personal information and isolate
              it from any further processing until deletion is possible.
            </p>

            <h2 id="privacy-rights" className="text-2xl font-bold mt-8 mb-4">
              8. What Are Your Privacy Rights?
            </h2>

            <p className="italic">
              In Short: Depending on your state of residence in the US or in
              some regions, such as the European Economic Area (EEA), United
              Kingdom (UK), Switzerland, and Canada, you have rights that allow
              you greater access to and control over your personal information.
              You may review, change, or terminate your account at any time,
              depending on your country, province, or state of residence.
            </p>

            <p>
              In some regions (like the EEA, UK, Switzerland, and Canada), you
              have certain rights under applicable data protection laws. These
              may include the right (i) to request access and obtain a copy of
              your personal information, (ii) to request rectification or
              erasure; (iii) to restrict the processing of your personal
              information; (iv) if applicable, to data portability; and (v) not
              to be subject to automated decision-making.
            </p>

            <p>
              In certain circumstances, you may also have the right to object to
              the processing of your personal information. You can make such a
              request by contacting us by using the contact details provided in
              the section "How Can You Contact Us About This Notice?" below.
            </p>

            <p>
              We will consider and act upon any request in accordance with
              applicable data protection laws.
            </p>

            <p>
              If you are located in the EEA or UK and you believe we are
              unlawfully processing your personal information, you also have the
              right to complain to your{" "}
              <a
                href="https://ec.europa.eu/justice/data-protection/bodies/authorities/index_en.htm"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#8B5CF6] hover:underline"
              >
                Member State data protection authority
              </a>{" "}
              or{" "}
              <a
                href="https://ico.org.uk/make-a-complaint/data-protection-complaints/data-protection-complaints/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#8B5CF6] hover:underline"
              >
                UK data protection authority
              </a>
              .
            </p>

            <p>
              If you are located in Switzerland, you may contact the{" "}
              <a
                href="https://www.edoeb.admin.ch/edoeb/en/home.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#8B5CF6] hover:underline"
              >
                Federal Data Protection and Information Commissioner
              </a>
              .
            </p>

            <h3 className="text-lg font-semibold mt-6 mb-3">
              Withdrawing Your Consent
            </h3>

            <p>
              If we are relying on your consent to process your personal
              information, which may be express and/or implied consent depending
              on the applicable law, you have the right to withdraw your consent
              at any time. You can withdraw your consent at any time by
              contacting us by using the contact details provided in the section
              "How Can You Contact Us About This Notice?" below or updating your
              preferences.
            </p>

            <p>
              However, please note that this will not affect the lawfulness of
              the processing before its withdrawal nor, when applicable law
              allows, will it affect the processing of your personal information
              conducted in reliance on lawful processing grounds other than
              consent.
            </p>

            <h3 className="text-lg font-semibold mt-6 mb-3">
              Account Information
            </h3>

            <p>
              If you would at any time like to review or change the information
              in your account or terminate your account, you can:
            </p>

            <ul>
              <li>
                Log in to your account settings and update your user account.
              </li>
              <li>Contact us using the contact information provided.</li>
            </ul>

            <p>
              Upon your request to terminate your account, we will deactivate or
              delete your account and information from our active databases.
              However, we may retain some information in our files to prevent
              fraud, troubleshoot problems, assist with any investigations,
              enforce our legal terms and/or comply with applicable legal
              requirements.
            </p>

            <h2 id="dnt" className="text-2xl font-bold mt-8 mb-4">
              9. Controls for Do-Not-Track Features
            </h2>

            <p>
              Most web browsers and some mobile operating systems and mobile
              applications include a Do-Not-Track ("DNT") feature or setting you
              can activate to signal your privacy preference not to have data
              about your online browsing activities monitored and collected. At
              this stage, no uniform technology standard for recognizing and
              implementing DNT signals has been finalized. As such, we do not
              currently respond to DNT browser signals or any other mechanism
              that automatically communicates your choice not to be tracked
              online.
            </p>

            <p>
              California law requires us to let you know how we respond to web
              browser DNT signals. Because there currently is not an industry or
              legal standard for recognizing or honoring DNT signals, we do not
              respond to them at this time.
            </p>

            <h2 id="us-laws" className="text-2xl font-bold mt-8 mb-4">
              10. Do United States Residents Have Specific Privacy Rights?
            </h2>

            <p className="italic">
              In Short: If you are a resident of California, Colorado,
              Connecticut, Delaware, Florida, Indiana, Iowa, Kentucky, Maryland,
              Minnesota, Montana, Nebraska, New Hampshire, New Jersey, Oregon,
              Rhode Island, Tennessee, Texas, Utah, or Virginia, you may have
              the right to request access to and receive details about the
              personal information we maintain about you and how we have
              processed it, correct inaccuracies, get a copy of, or delete your
              personal information. You may also have the right to withdraw your
              consent to our processing of your personal information.
            </p>

            <h3 className="text-lg font-semibold mt-6 mb-3">
              Categories of Personal Information We Collect
            </h3>

            <p>
              We have not collected any personal information in the categories
              listed below in the past twelve (12) months:
            </p>

            <ul>
              <li>A. Identifiers</li>
              <li>
                B. Personal information as defined in the California Customer
                Records statute
              </li>
              <li>
                C. Protected classification characteristics under state or
                federal law
              </li>
              <li>D. Commercial information</li>
              <li>E. Biometric information</li>
              <li>F. Internet or other similar network activity</li>
              <li>G. Geolocation data</li>
              <li>H. Audio, electronic, sensory, or similar information</li>
              <li>I. Professional or employment-related information</li>
              <li>J. Education Information</li>
              <li>K. Inferences drawn from collected personal information</li>
              <li>L. Sensitive personal Information</li>
            </ul>

            <p>
              We may also collect other personal information outside of these
              categories through instances where you interact with us in person,
              online, or by phone or mail in the context of:
            </p>

            <ul>
              <li>Receiving help through our customer support channels;</li>
              <li>Participation in customer surveys or contests; and</li>
              <li>
                Facilitation in the delivery of our Services and to respond to
                your inquiries.
              </li>
            </ul>

            <h3 className="text-lg font-semibold mt-6 mb-3">
              How We Use and Share Personal Information
            </h3>

            <p>
              We may use your personal information for our own business
              purposes, such as for undertaking internal research for
              technological development and demonstration. This is not
              considered to be "selling" of your personal information.
            </p>

            <p>
              We have not disclosed, sold, or shared any personal information to
              third parties for a business or commercial purpose in the
              preceding twelve (12) months. We will not sell or share personal
              information in the future belonging to website visitors, users,
              and other consumers.
            </p>

            <h3 className="text-lg font-semibold mt-6 mb-3">Your Rights</h3>

            <p>
              You have rights under certain US state data protection laws.
              However, these rights are not absolute, and in certain cases, we
              may decline your request as permitted by law. These rights
              include:
            </p>

            <ul>
              <li>
                <strong>Right to know</strong> whether or not we are processing
                your personal data
              </li>
              <li>
                <strong>Right to access</strong> your personal data
              </li>
              <li>
                <strong>Right to correct</strong> inaccuracies in your personal
                data
              </li>
              <li>
                <strong>Right to request</strong> the deletion of your personal
                data
              </li>
              <li>
                <strong>Right to obtain a copy</strong> of the personal data you
                previously shared with us
              </li>
              <li>
                <strong>Right to non-discrimination</strong> for exercising your
                rights
              </li>
              <li>
                <strong>Right to opt out</strong> of the processing of your
                personal data if it is used for targeted advertising, the sale
                of personal data, or profiling
              </li>
            </ul>

            <h3 className="text-lg font-semibold mt-6 mb-3">
              How to Exercise Your Rights
            </h3>

            <p>
              To exercise these rights, you can contact us by emailing us at{" "}
              <a
                href="mailto:support@integral.com"
                className="text-[#8B5CF6] hover:underline"
              >
                support@integral.com
              </a>
              , or by referring to the contact details at the bottom of this
              document.
            </p>

            <p>
              Under certain US state data protection laws, you can designate an
              authorized agent to make a request on your behalf. We may deny a
              request from an authorized agent that does not submit proof that
              they have been validly authorized to act on your behalf in
              accordance with applicable laws.
            </p>

            <h3 className="text-lg font-semibold mt-6 mb-3">
              Request Verification
            </h3>

            <p>
              Upon receiving your request, we will need to verify your identity
              to determine you are the same person about whom we have the
              information in our system. We will only use personal information
              provided in your request to verify your identity or authority to
              make the request. However, if we cannot verify your identity from
              the information already maintained by us, we may request that you
              provide additional information for the purposes of verifying your
              identity and for security or fraud-prevention purposes.
            </p>

            <h3 className="text-lg font-semibold mt-6 mb-3">Appeals</h3>

            <p>
              Under certain US state data protection laws, if we decline to take
              action regarding your request, you may appeal our decision by
              emailing us at{" "}
              <a
                href="mailto:support@integral.com"
                className="text-[#8B5CF6] hover:underline"
              >
                support@integral.com
              </a>
              . We will inform you in writing of any action taken or not taken
              in response to the appeal, including a written explanation of the
              reasons for the decisions. If your appeal is denied, you may
              submit a complaint to your state attorney general.
            </p>

            <h3 className="text-lg font-semibold mt-6 mb-3">
              California "Shine The Light" Law
            </h3>

            <p>
              California Civil Code Section 1798.83, also known as the "Shine
              The Light" law, permits our users who are California residents to
              request and obtain from us, once a year and free of charge,
              information about categories of personal information (if any) we
              disclosed to third parties for direct marketing purposes and the
              names and addresses of all third parties with which we shared
              personal information in the immediately preceding calendar year.
              If you are a California resident and would like to make such a
              request, please submit your request in writing to us by using the
              contact details provided in the section "How Can You Contact Us
              About This Notice?"
            </p>

            <h2 id="policy-updates" className="text-2xl font-bold mt-8 mb-4">
              11. Do We Make Updates to This Notice?
            </h2>

            <p className="italic">
              In Short: Yes, we will update this notice as necessary to stay
              compliant with relevant laws.
            </p>

            <p>
              We may update this Privacy Notice from time to time. The updated
              version will be indicated by an updated "Revised" date at the top
              of this Privacy Notice. If we make material changes to this
              Privacy Notice, we may notify you either by prominently posting a
              notice of such changes or by directly sending you a notification.
              We encourage you to review this Privacy Notice frequently to be
              informed of how we are protecting your information.
            </p>

            <h2 id="contact" className="text-2xl font-bold mt-8 mb-4">
              12. How Can You Contact Us About This Notice?
            </h2>

            <p>
              If you have questions or comments about this notice, you may email
              us at{" "}
              <a
                href="mailto:support@integral.com"
                className="text-[#8B5CF6] hover:underline"
              >
                support@integral.com
              </a>{" "}
              or contact us by post at:
            </p>

            <address className="not-italic ml-4">
              INTEGRAL LABS LLC
              <br />
              Wyoming, United States
            </address>

            <h2 id="request" className="text-2xl font-bold mt-8 mb-4">
              13. How Can You Review, Update, or Delete the Data We Collect From
              You?
            </h2>

            <p>
              Based on the applicable laws of your country or state of residence
              in the US, you may have the right to request access to the
              personal information we collect from you, details about how we
              have processed it, correct inaccuracies, or delete your personal
              information. You may also have the right to withdraw your consent
              to our processing of your personal information. These rights may
              be limited in some circumstances by applicable law.
            </p>

            <p>
              To request to review, update, or delete your personal information,
              please contact us at{" "}
              <a
                href="mailto:support@integral.com"
                className="text-[#8B5CF6] hover:underline"
              >
                support@integral.com
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
