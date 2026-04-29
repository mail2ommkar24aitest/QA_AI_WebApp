const apiKey = 'YOUR_KEY_HERE'; // I'll test with a dummy or just check the structure
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

async function testFetch() {
  try {
    const res = await fetch(url);
    const json = await res.json();
    console.log(JSON.stringify(json, null, 2));
  } catch (err) {
    console.error(err);
  }
}
testFetch();
