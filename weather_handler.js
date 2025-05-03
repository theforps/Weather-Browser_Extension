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

  // Получение текущего города по IP
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

  // Получение и отображение погоды
  async function getWeather(city) {
    const apiKey = "ddcf041e48294f1f922192858231501"; // Твой API-ключ
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

  // Получение списка стран и городов
  async function getCities() {
    const response = await fetch(
      "https://countriesnow.space/api/v0.1/countries"
    );
    const json = await response.json();
    const citiesData = json.data;

    data = Object.groupBy(citiesData, ({ country }) => country);
    loadCountries(data);
  }

  // Загрузка стран в боковое меню
  function loadCountries(data) {
    Object.keys(data).forEach((country) => {
      // Создаем кнопку для страны
      const button = document.createElement("button");
      button.classList.add("country-tab");
      button.innerText = country;
      button.onclick = () => toggleCities(country);

      // Создаем список городов для этой страны
      const cityList = document.createElement("ul");
      cityList.id = country;
      cityList.classList.add("city-list");
      data[country][0].cities.forEach((city) => {
        const cityItem = document.createElement("li");
        cityItem.innerText = city;
        cityItem.onclick = () => showWeather(city);
        cityList.appendChild(cityItem);
      });

      // Добавляем кнопку страны и список городов в меню
      sidebar.appendChild(button);
      sidebar.appendChild(cityList);
    });
  }

  // Функция для отображения/скрытия списка городов
  function toggleCities(country) {
    const cityList = document.getElementById(country);
    if (cityList.style.display === "none" || cityList.style.display === "") {
      cityList.style.display = "block";
    } else {
      cityList.style.display = "none";
    }

    // Скрытие всех других списков городов
    const allCities = document.querySelectorAll(".city-list");
    allCities.forEach((list) => {
      if (list.id !== country) {
        list.style.display = "none";
      }
    });
  }

  // Функция для отображения погоды для выбранного города
  async function showWeather(city) {
    await getWeather(city);
  }

  // Обработчик кнопки для сворачивания бокового меню
  toggleBtn.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
    const allCityLists = document.querySelectorAll(".city-list");
    allCityLists.forEach((list) => (list.style.display = "none"));
  });
});
