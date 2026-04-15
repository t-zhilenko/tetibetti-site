"use client";

import {useLocale} from "next-intl";
import EmailCaptureForm from "@/components/EmailCaptureForm";
import Modal from "@/components/Modal";
import {trackEvent} from "@/lib/analytics";

type CheckoutPlaceholderModalProps = {
  open: boolean;
  onClose: () => void;
  source: "cart_drawer_checkout_modal" | "cart_page_checkout_modal" | "checkout_page_modal";
  itemCount: number;
};

export default function CheckoutPlaceholderModal({
  open,
  onClose,
  source,
  itemCount,
}: CheckoutPlaceholderModalProps) {
  const locale = useLocale();
  const isUkrainian = locale === "uk";

  return (
    <Modal
      open={open}
      title={isUkrainian ? "Оформлення незабаром" : "Checkout is coming soon"}
      onClose={onClose}
    >
      <div className="space-y-5">
        <div className="space-y-2 text-center">
          <p className="text-sm text-deep/68">
            {isUkrainian
              ? "Безпечна оплата буде доступна тут зовсім скоро."
              : "Secure payment will be available here shortly."}
          </p>
          <p className="text-sm text-deep/68">
            {isUkrainian
              ? "Залиште email і ми повідомимо, коли оформлення оплати стане доступним."
              : "Leave your email and we'll let you know when checkout goes live."}
          </p>
        </div>
        <EmailCaptureForm
          variant="waitlist"
          endpoint="/api/brevo/subscribe"
          submitLabel={isUkrainian ? "Повідомте мене" : "Notify me"}
          submittingLabel={isUkrainian ? "Додаємо..." : "Adding..."}
          helperText={
            isUkrainian
              ? "Без спаму. Лише один лист, коли оформлення оплати буде готове."
              : "No spam. Just one email when checkout is ready."
          }
          successLines={
            isUkrainian
              ? [
                  "Ви у списку раннього доступу до оформлення оплати.",
                  "Ми напишемо вам, коли безпечна оплата стане доступною.",
                ]
              : [
                  "You're on the checkout early-access list.",
                  "We'll email you when secure checkout is live.",
                ]
          }
          analytics={{
            source,
          }}
          onSuccess={() => {
            trackEvent("checkout_email_submitted", {
              source,
              cart_items: itemCount,
            });
          }}
        />
      </div>
    </Modal>
  );
}
