async function example1() {
  try {
    // fetch returns Promise object
    let responseObject = await fetch(
      "https://mdn.github.io/learning-area/javascript/apis/fetching-data/can-store/products.json"
    );
    let data = await responseObject.json();
    console.log(data);
  } catch (e) {
    console.log(e);
  }
}

async function example2() {
  // axios.get() returns a Promise object
  // Axios Response Object
  try {
    let axiosResponseObject = await axios.get(
      "https://mdn.github.io/learning-area/javascript/apis/fetching-data/can-store/products.json"
    );
    console.log(axiosResponseObject.data);
  } catch (e) {
    console.log(e);
  }
}

example1();
example2();
