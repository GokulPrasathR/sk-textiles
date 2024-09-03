import { Fragment, useContext, useState } from 'react';
import { CartItemsContext } from '../../../Context/CartItemsContext';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import Badge from '@mui/material/Badge';
import CartCard from './CartCard/CartCard';
import './Cart.css';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Snackbar from '@mui/material/Snackbar';
import axios from 'axios';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  minWidth: '350px',
  width: '45%',
  height: 'auto',
  bgcolor: 'background.paper',
  border: '5px solid #FFE26E',
  borderRadius: '15px',
  boxShadow: 24,
  p: 4,
};

const Cart = () => {
  const [open, setOpen] = useState(false);
  const [openCheckoutModal, setOpenCheckoutModal] = useState(false);
  const [openPaymentOptions, setOpenPaymentOptions] = useState(false);
  const [openCODModal, setOpenCODModal] = useState(false);
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [openToast, setOpenToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [invoiceUrl, setInvoiceUrl] = useState('');

  const cartItems = useContext(CartItemsContext);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleCheckoutClose = () => setOpenCheckoutModal(false);
  const handlePaymentOptionsOpen = () => setOpenPaymentOptions(true);
  const handlePaymentOptionsClose = () => setOpenPaymentOptions(false);

  const handleCheckout = () => {
    if (cartItems.totalAmount > 0) {
      handlePaymentOptionsOpen();
    } else {
      alert("Cart is empty. Please add items to checkout.");
    }
  };

  const handleGPayPayment = () => {
    const paymentRequest = new PaymentRequest(
      [{
        supportedMethods: 'https://google.com/pay',
        data: {
          environment: 'TEST', // Use TEST or PRODUCTION
          apiVersion: 2,
          apiVersionMinor: 0,
          merchantInfo: {
            merchantId: 'your-merchant-id', // Replace with actual merchant ID
            merchantName: 'Your Store',
          },
          allowedPaymentMethods: [{
            type: 'CARD',
            parameters: {
              allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
              allowedCardNetworks: ['MASTERCARD', 'VISA'],
            },
            tokenizationSpecification: {
              type: 'PAYMENT_GATEWAY',
              parameters: {
                gateway: 'example', // Replace with your payment gateway
                gatewayMerchantId: 'exampleGatewayMerchantId',
              },
            },
          }],
        }
      }],
      {
        total: {
          label: 'Total',
          amount: { currency: 'INR', value: cartItems.totalAmount.toString() },
        },
      }
    );

    paymentRequest.show().then(paymentResponse => {
      axios.post("http://localhost:3000/api/payment", {
        paymentMethod: 'gpay',
        paymentToken: paymentResponse.details.paymentToken
      })
      .then(res => {
        paymentResponse.complete('success');
        setToastMessage('Payment Successful!');
        setOpenToast(true);

        // Get the invoice URL from the response
        setInvoiceUrl(res.data.invoiceUrl);

        handleCheckoutClose();
        setOpenCheckoutModal(true);
      })
      .catch(err => {
        paymentResponse.complete('fail');
        setToastMessage('Payment Failed!');
        setOpenToast(true);
        console.error(err);
      });
    }).catch(err => console.error(err));
  };

  const handleCODPayment = () => {
    if (!address || !pincode) {
      alert("Please enter your address and pincode.");
      return;
    }
  
    setTimeout(() => {
      axios.post("http://localhost:3000/api/cod", {
        address,
        pincode,
        location,
        cartItems
      })
      .then(() => {
        setToastMessage('Order Placed Successfully!');
        setOpenToast(true);
        setOpenCheckoutModal(true);
        handlePaymentOptionsClose();
      })
      .catch(err => console.error(err));
    }, 1000);
  };
  

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error(error);
          alert("Unable to fetch location.");
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  const handleDownloadInvoice = () => {
    if (invoiceUrl) {
      window.open(invoiceUrl, '_blank');
    } else {
      alert("Invoice not available.");
    }
  };

  return (
    <Fragment>
      <Badge badgeContent={cartItems.items.length} color="error">
        <ShoppingCartIcon color="black" onClick={handleOpen} sx={{ width: '35px' }} />
      </Badge>
      <Modal
        open={open}
        onClose={handleClose}
      >
        <Box sx={style}>
          <div className="cart__header">
            <h2>Your Cart</h2>
          </div>
          <div className="cart__items__container">
            {cartItems.items.length === 0 ? (
              <div className="cart__empty"> Empty cart!</div>
            ) : (
              <Fragment>
                <div className="shop__cart__items">
                  {cartItems.items.map((item) => (
                    <CartCard key={item._id} item={item} />
                  ))}
                </div>
                <div className="options">
                  <div className="total__amount">
                    <div className="total__amount__label">Total Amount:</div>
                    <div className="total__amount__value">₹{cartItems.totalAmount}.00</div>
                  </div>
                  <Button variant="outlined" onClick={handleCheckout}>Checkout</Button>
                </div>
              </Fragment>
            )}
          </div>
        </Box>
      </Modal>

      {/* Payment Options Modal */}
      <Modal
        open={openPaymentOptions}
        onClose={handlePaymentOptionsClose}
      >
        <Box sx={style}>
          <div className="payment__options">
            <h3>Select Payment Method</h3>
            <Button
              variant="contained"
              color="primary"
              onClick={handleGPayPayment}
              sx={{ margin: '10px' }}
            >
              Pay with GPay
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => setOpenCODModal(true)}
              sx={{ margin: '10px' }}
            >
              Cash on Delivery
            </Button>
          </div>
        </Box>
      </Modal>

      {/* COD Address Modal */}
      <Modal
        open={openCODModal}
        onClose={() => setOpenCODModal(false)}
      >
        <Box sx={style}>
          <h3>Enter Delivery Details</h3>
          <TextField
            label="Address"
            variant="outlined"
            fullWidth
            margin="normal"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          <TextField
            label="Pincode"
            variant="outlined"
            fullWidth
            margin="normal"
            value={pincode}
            onChange={(e) => setPincode(e.target.value)}
          />
          <Button variant="contained" onClick={handleGetLocation}>
            Get Location
          </Button>
          <Button variant="contained" color="primary" onClick={handleCODPayment} sx={{ marginTop: '10px' }}>
            Confirm COD Payment
          </Button>
        </Box>
      </Modal>

      {/* Checkout Success Modal */}
      <Modal
        open={openCheckoutModal}
        onClose={handleCheckoutClose}
      >
        <Box sx={style}>
          <div className="checkout-success-content">
            <h2>Your checkout was successful</h2>
            {invoiceUrl && (
              <Button variant="outlined" onClick={handleDownloadInvoice}>
                Download Invoice
              </Button>
            )}
          </div>
        </Box>
      </Modal>

      {/* Toast Notification */}
      <Snackbar
        open={openToast}
        autoHideDuration={6000}
        onClose={() => setOpenToast(false)}
        message={toastMessage}
      />
    </Fragment>
  );
};

export default Cart;
