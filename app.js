// Initialize Appwrite Client
const appwrite = new Appwrite.Client();
const databases = new Appwrite.Databases(appwrite);

appwrite
  .setEndpoint('https://cloud.appwrite.io/v1') // Appwrite API endpoint
  .setProject('membership-zensolve'); // Appwrite Project ID

// Event Listener for Form Submission
document.getElementById('submitBtn').addEventListener('click', () => {
  // Collect form data
  const form = document.getElementById('membershipForm');
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  // Generate a unique reference number
  const refNumber = `REF${Date.now()}`;
  data.refNumber = refNumber;

  // Store form data in session storage
  sessionStorage.setItem('membershipData', JSON.stringify(data));

  // Hide form and show the review container
  document.getElementById('form-container').style.display = 'none';
  const reviewContainer = document.getElementById('review-container');
  reviewContainer.style.display = 'block';

  // Populate the review container with the entered data
  const reviewDetails = document.getElementById('reviewDetails');
  reviewDetails.innerHTML = `
    <p><strong>Reference Number:</strong> ${data.refNumber}</p>
    <p><strong>Name:</strong> ${data.name}</p>
    <p><strong>Father's Name:</strong> ${data.fatherName}</p>
    <p><strong>Mobile:</strong> ${data.mobile}</p>
    <p><strong>State:</strong> ${data.state}</p>
    <p><strong>District:</strong> ${data.district}</p>
  `;
});

// Event Listener for Edit Button
document.getElementById('editBtn').addEventListener('click', () => {
  // Retrieve data from session storage
  const data = JSON.parse(sessionStorage.getItem('membershipData'));

  // Populate the form with the stored data for editing
  const form = document.getElementById('membershipForm');
  form.elements.name.value = data.name;
  form.elements.fatherName.value = data.fatherName;
  form.elements.mobile.value = data.mobile;
  form.elements.state.value = data.state;
  form.elements.district.value = data.district;

  // Hide review container and show the form for editing
  document.getElementById('review-container').style.display = 'none';
  document.getElementById('form-container').style.display = 'block';
});

// Event Listener for Next Button
document.getElementById('nextBtn').addEventListener('click', () => {
  // Retrieve data from session storage
  const data = JSON.parse(sessionStorage.getItem('membershipData'));

  // Save the data to Appwrite
  const databaseId = 'membership'; // Replace with your database ID
  const collectionId = 'form';     // Replace with your collection ID

  databases.createDocument(databaseId, collectionId, data.refNumber, data)
    .then(() => {
      console.log('Data saved to Appwrite!');

      // Open Gmail with pre-filled details
      const mailBody = `Details:\n${JSON.stringify(data, null, 2)}`;
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=care@zensolve.in&su=Membership Details&body=${encodeURIComponent(mailBody)}`;
      window.open(gmailUrl, '_blank');

      // Show payment page
      document.getElementById('review-container').style.display = 'none';
      document.getElementById('payment-container').style.display = 'block';
    })
    .catch((error) => {
      console.error('Error saving to Appwrite:', error);
      alert('Failed to save your data. Please try again.');
    });
});

// Event Listener for Payment Button
document.getElementById('payBtn').addEventListener('click', () => {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  if (isMobile) {
    // Open UPI payment link
    const upiLink = 'upi://pay?pa=zensolve@sbi&am=1&tn=For Zensolve Membership &cu=INR';
    window.open(upiLink, '_blank');
  } else {
    // Redirect to a message page for desktop users
    document.body.innerHTML = `
      <div style="
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 100vh;
        background: linear-gradient(135deg, #FFDEE9, #B5FFFC);
        color: #333;
        text-align: center;
      ">
        <h1 style="
          font-size: 2.5rem;
          color: #444;
          background: linear-gradient(90deg, #FF9A9E, #FAD0C4);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        ">Use Your Mobile to Get Membership</h1>
        <img src="qr.jpeg" style="width: 600px; height: 600px;">

        <p style="
          font-size: 1.2rem;
          color: #555;
          margin: 20px 0;
        ">Please scan the UPI code or open this page on your mobile device to complete the payment.</p>
        <button style="
          padding: 10px 20px;
          font-size: 1rem;
          background: #FFDEE9;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s;
        " onclick="window.location.reload()">Go Back</button>
      </div>
    `;
  }
});