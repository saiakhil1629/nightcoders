async function test() {
  try {
    const res = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: "admin@code2career.com", password: "admin12345" })
    });
    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Response Text:", JSON.stringify(text));
  } catch (err) {
    console.error("Fetch Error:", err);
  }
}
test();
