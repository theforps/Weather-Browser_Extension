window.addEventListener("load", function () {
  const preloader = document.getElementById("preloader");
  preloader.style.opacity = "0";
  setTimeout(() => {
    preloader.style.display = "none";
  }, 500);
});

document.addEventListener("DOMContentLoaded", async function getUserLocation() {
  const sidebar = document.getElementById("sidebar");
  const toggleBtn = document.getElementById("toggle-btn");
  let data = {};
  let currentCity = localStorage.getItem("city");

  if (currentCity == null) {
    currentCity = await getCurrentCity();
  }

  await getWeather(currentCity);
  await getCities();

  async function getCurrentCity() {
    const apiKey = "d9e53816d07345139c58d0ea733e3870";
    const response = await fetch(
      `https://api.bigdatacloud.net/data/ip-geolocation?key=${apiKey}`
    );
    if (response.ok) {
      const json = await response.json();
      return json.location.city;
    } else {
      alert("HTTP error: " + response.status);
    }
  }

  async function getWeather(city) {
    const apiKey = "ddcf041e48294f1f922192858231501";
    const response = await fetch(
      `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}&aqi=no`
    );
    if (response.ok) {
      const json = await response.json();
      localStorage.setItem("city", city);
      document.getElementById("weatherLocation").innerText = city;
      document.getElementById("weatherCountry").innerText =
        json.location.country;
      document.getElementById("weatherTemp").innerText =
        json.current.temp_c + " ℃";
      document.getElementById("weatherDescription").innerText =
        json.current.condition.text;
      document.getElementById("weatherImage").src =
        "https:" + json.current.condition.icon;
    } else {
      alert("Weather error: " + response.status);
    }
  }

  async function getCities() {
    const response = await fetch(
      "https://countriesnow.space/api/v0.1/countries"
    );
    const json = await response.json();
    const citiesData = json.data;

    data = Object.groupBy(citiesData, ({ country }) => country);
    loadCountries(data);
  }

  function loadCountries(data) {
    Object.keys(data).forEach((country) => {
      const button = document.createElement("button");
      button.classList.add("country-tab");
      button.innerText = country;
      button.onclick = () => toggleCities(country);

      const cityList = document.createElement("ul");
      cityList.id = country;
      cityList.classList.add("city-list");
      data[country][0].cities.forEach((city) => {
        const cityItem = document.createElement("li");
        cityItem.innerText = city;
        cityItem.onclick = () => showWeather(city);
        cityList.appendChild(cityItem);
      });

      sidebar.appendChild(button);
      sidebar.appendChild(cityList);
    });
  }

  function toggleCities(country) {
    const cityList = document.getElementById(country);
    if (cityList.style.display === "none" || cityList.style.display === "") {
      cityList.style.display = "block";
    } else {
      cityList.style.display = "none";
    }

    const allCities = document.querySelectorAll(".city-list");
    allCities.forEach((list) => {
      if (list.id !== country) {
        list.style.display = "none";
      }
    });
  }

  async function showWeather(city) {
    await getWeather(city);
  }

  toggleBtn.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
    const allCityLists = document.querySelectorAll(".city-list");
    allCityLists.forEach((list) => (list.style.display = "none"));
  });
});
