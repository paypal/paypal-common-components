/* @flow */

window.__TEST_FUNDING_ELIGIBILITY__ = {
  bancontact: {
    eligible: false,
  },
  card: {
    eligible: true,
    isPayPalBranded: true,

    vendors: {
      visa: {
        eligible: true,
      },
      mastercard: {
        eligible: true,
      },
      amex: {
        eligible: true,
      },
      discover: {
        eligible: true,
      },
      hiper: {
        eligible: false,
      },
      elo: {
        eligible: false,
      },
      jcb: {
        eligible: false,
      },
    },
  },
  credit: {
    eligible: false,
  },
  sepa: {
    eligible: false,
  },
  eps: {
    eligible: false,
  },
  giropay: {
    eligible: false,
  },
  ideal: {
    eligible: false,
  },
  mybank: {
    eligible: false,
  },
  p24: {
    eligible: false,
  },
  paypal: {
    eligible: true,
  },
  sofort: {
    eligible: false,
  },
  venmo: {
    eligible: false,
  },
  wechatpay: {
    eligible: false,
  },
  zimpler: {
    eligible: false,
  },
  mercadopago: {
    eligible: false,
  },
  verkkopankki: {
    eligible: false,
  },
  boleto: {
    eligible: false,
  },
  boletobancario: {
    eligible: false,
  },
  multibanco: {
    eligible: false,
  },
  satispay: {
    eligible: false,
  },
};

window.__TEST_REMEMBERED_FUNDING__ = [];
window.__PAYPAL_DOMAIN__ = "mock://www.paypal.com";
window.__PAYPAL_API_DOMAIN__ = "mock://msmaster.qa.paypal.com";
