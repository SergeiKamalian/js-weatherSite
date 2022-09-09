// api key
let API_KEY = '244b68ce966f12e9e09c1b81b743632b'

// differences
let dayWeatherInfo = document.querySelector('.day_weather_info');
let dayWeatherBigInfo = document.querySelector('.today_info_content');
let weekDays = document.querySelector('.days_info');
let inputSearch = document.querySelector('.input_search');
let btnSearch = document.querySelector('.search_button');
let loader = document.querySelector('.loader_div');
let selectedCities = document.querySelector('.select_Cities')
let errorPage = document.querySelector('.error_page');
let errorPageDel = document.querySelector('.error_page_del')
let weatherCityName;
let addCityBtn;

// arrays
let activeCities = [];
let citiesArr = [];

refreshSite()

// обновление сайта
function refreshSite() {
    refreshActiveCities()
    sprintActiveCities()
    getActiveItem(citiesArr, 'selectedCities_item_active')
    getActiveCities()
}
// обновление активных мест
function getActiveCities() {
    if (Object.keys(sessionStorage).length > 0) {
        activeCities = Object.keys(sessionStorage);
    } else {
        activeCities = ['Ijevan'];
    }
}
// добавление в local storage
function addCitiesLocaleStorage() {
    activeCities.forEach(i => {
        sessionStorage.setItem(i, 'City')
    })
    return Object.keys(sessionStorage)
}
// удаление из local storage
function removeCitiesLocaleStorage() {
    activeCities.forEach(i => {
        sessionStorage.removeItem(i)
    })
    return Object.keys(sessionStorage)
}
// обновление local storage
function refreshActiveCities() {
    if (addCitiesLocaleStorage().length) {
        activeCities = addCitiesLocaleStorage();
    }else {
        activeCities = ['Ijevan'];
    }
}
// первоначальное появление 
async function sprintActiveCities() {
    console.log(activeCities);
    loader.classList.remove('hidden')
    selectedCities.innerHTML = ''
    activeCities.forEach(async (i) => {
        selectedCities.insertAdjacentHTML("beforeend", `
            <div class="selectedCities_item" data-value="${i}">${i}</div>
        `)
    })
    selectedCities.children[0].classList.add('selectedCities_item_active')
    citiesArr = Array.from(selectedCities.children)

    citiesArr.forEach(async (i) => {
        if (i.classList.contains('selectedCities_item_active')) {
            let activeCity = i.getAttribute('data-value');
            let activeCityCord = await getCityWeather(activeCity)
            let activeCityWeekCord = await getCityWeekWeather(activeCity)
            sprintDayInfo(activeCityCord.data)
            sprintWeekInfo(activeCityWeekCord)
            loader.classList.add('hidden')
        }
    })
}
// функция для поиска координатов
async function getCoordinates(city) {
    let data = await axios.get(`http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=5&appid=${API_KEY}`)
    if (data.data.length != 0) {
        return {
            lat: data.data[0].lat,
            lon: data.data[0].lon
        }
    } else {
        errorPage.classList.remove('hidden');
        setTimeout(() => {
            errorPage.classList.add('hidden')
        }, 1000)
    }
}
// функция для поиска погоды на один день
async function getCityWeather(city) {
    let coords = await getCoordinates(city)

    if (coords != undefined) {
        return await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${coords.lat}&lon=${coords.lon}&appid=${API_KEY}`)
    }
}
// функция для поиска на неделю
async function getCityWeekWeather(city) {
    let coords = await getCoordinates(city)
    if (coords != undefined) {
        let weekAll = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?lat=${coords.lat}&lon=${coords.lon}&appid=${API_KEY}`)
        let weatherArr = weekAll.data.list;
        let returnArr = [];
        for (let i = 0; i < weatherArr.length; i++) {
            returnArr.push(weatherArr[i])
            i = i + 7;
        }
        return returnArr;
    }
}
// функция для понимания сегодняшнего дня
function getWeekDay() {
    let date = new Date();
    let day = date.toDateString().split(' ')[0];
    switch (day) {
        case 'Mon':
            day = 'Monday'
            break;
        case 'Tue':
            day = 'Tuesday'
            break;
        case 'Wed':
            day = 'Wednesday'
            break;
        case 'Thu':
            day = 'Thursday'
            break;
        case 'Fri':
            day = 'Friday'
            break;
        case 'Sat':
            day = 'Saturday'
            break;
        case 'Sun':
            day = 'Sunday'
            break;
        default:
            break;
    }
    return day;
}
// функция для понимания дней на 5 
function getWeekDays() {
    let days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",
        "Monday", "Tuesday", "Wednesday", "Thursday"];
    let nowDay = getWeekDay()
    let returnDays = days.splice(days.indexOf(nowDay), 5)
    return returnDays
}
// функция для поиска активного элемента
async function getActiveItem(arr, className) {
    let active;
    arr.forEach(i => {
        i.addEventListener('click', async () => {
            arr.forEach(o => {
                o.classList.remove(className)
            })
            loader.classList.remove('hidden')
            i.classList.add(className)
            active = i.getAttribute('data-value')
            let activeCityCord = await getCityWeather(active)
            let activeCityWeekCord = await getCityWeekWeather(active)
            sprintDayInfo(activeCityCord.data)
            sprintWeekInfo(activeCityWeekCord)
            loader.classList.add('hidden')
        })
    })
}
// функция для обнуления активного города
function removeActiveItems(arr, className) {
    arr.forEach(i => {
        i.classList.remove(className)
    })
}
// функция для преврещения из цифра в дату
function unixToDate(unix) {
    let date = new Date(unix * 1000)
    let hours = date.getHours()
    let minutes = date.getMinutes()
    let seconds = date.getSeconds()
    if (hours <= 9) {
        hours = '0' + hours;
    }
    if (minutes <= 9) {
        minutes = '0' + minutes;
    }
    if (seconds <= 9) {
        seconds = '0' + seconds
    }
    let readyDate = `${hours}:${minutes}:${seconds}`
    return readyDate;
}
// функция для введения на страницу дни недели
async function sprintWeekInfo(arr) {
    weekDays.innerHTML = '';
    let weekDaysFive = getWeekDays();
    arr.forEach((i, o) => {
        let tempMax = Math.round(i.main.temp_max - 273.15);
        let tempMin = Math.round(i.main.temp_min - 273.15);
        weekDays.insertAdjacentHTML('beforeend', `
            <div class="days_info_day">
                <span class="info_day_title">${weekDaysFive[o]}</span>
                <img src="img/${i.weather[0].icon}.png" alt="" class="info_day_img">
                <div class="info_gradus_div">
                    <span class="gradus_div_max">${tempMax}°</span>
                    <span class="gradus_div_min">${tempMin}°</span>
                </div>
            </div>
        `)
    })
}
// функция для введения на страницу день
async function sprintDayInfo(arr) {
    let rainMm;
    if (arr.rain != undefined) {
        let keys = Object.keys(arr.rain)
        rainMm = arr.rain[keys]
    } else {
        rainMm = 0;
    }
    let temp = Math.round(arr.main.temp - 273.15)
    let tempMax = Math.round(arr.main.temp_max - 273.15);
    let tempMin = Math.round(arr.main.temp_min - 273.15);
    let tempMiddle = (tempMax + tempMin) / 2;
    let sunsetTime = await unixToDate(arr.sys.sunset)
    let sunriseTime = await unixToDate(arr.sys.sunrise)
    let visibilityKm = arr.visibility / 1000;
    let nowDay = getWeekDay();
    dayWeatherInfo.innerHTML = `
        <div class="weather_image">
        <img src="img/${arr.weather[0].icon}.png" alt="" class="weather_img">
        </div>
        <span class="weather_temp">${temp}°</span>
        <span class="weather_city" data-value="${arr.name}">${arr.name}, <span>${arr.sys.country}</span></span>
        <span class="weather_weekendDay">${nowDay}</span>
        <div class="line"></div>
        <div class="weather_com">
            <img src="img/cloudy.png" alt="" class="cloudyImg">
            <span class="weather_com_text">${arr.weather[0].main}</span>
        </div>
        <div class="weather_com">
            <img src="img/rain.png" alt="" class="cloudyImg">
            <span class="weather_com_text">Rain - ${rainMm}mm</span>
        </div>
    `
    dayWeatherBigInfo.innerHTML = `
    <div class="today_info_item sunrise_sunset">
        <span class="info_item_title">Sunrise & Sunset</span>
        <div class="sunriseSunset_content">
            <div class="sunrSuns_content_item">
                <div class="sunrSuns_img">
                    <i class='bx bx-up-arrow-alt'></i>
                </div>
                <div class="sunrSuns_info">
                    <span class="done_time">${sunriseTime} AM</span>
                    <div class="normal_time">-1m 46s</div>
                </div>
            </div>
            <div class="sunrSuns_content_item">
                <div class="sunrSuns_img sunrSuns_img_2">
                    <i class='bx bx-down-arrow-alt'></i>
                </div>
                <div class="sunrSuns_info">
                    <span class="done_time">${sunsetTime} AM</span>
                    <div class="normal_time">-3m 08s</div>
                </div>
            </div>
        </div>
    </div>
    <div class="today_info_item maximum_minimum">
        <span class="info_item_title">Maximum & Minimum</span>
        <div class="maxMin_content">
            <div class="maxMin_text">
                <span class="maxMin_text_item">Min</span>
                <span class="maxMin_text_item">Max</span>
            </div>
        <div class="maxMin_line"></div>
        <div class="maxMin_graduses">
            <span class="maxMin_gradus">${tempMin}°</span>
            <span class="maxMin_gradus">${tempMax}°</span>
        </div>
        <div class="middle_gradus">
            <div class="middle_title">Middle temperature</div>
            <span class="middle_num">${tempMiddle}°</span>
        </div>
    </div>
    </div>

    <div class="today_info_item wind_status">
        <span class="info_item_title">Wind Status</span>
        <div class="wind_status_content">
            <span class="wind_num">${arr.wind.speed} km/h</span>
            <div class="wind_status_deg" style="transform: rotateZ(${arr.wind.deg}deg)">
                <i class='bx bxs-map bx-flip-vertical wind_map'></i>
            </div>
        </div>
    </div>

    <div class="today_info_item">
        <span class="info_item_title">Other Informaion</span>
        <div class="hum_content">
            <div class="visibility">
                <i class='bx bxs-low-vision'></i>
                <span class="oth_content_title">Visibility: <b>${visibilityKm}</b> km</span>
            </div>
            <div class="visibility">
                <i class='bx bxs-droplet-half'></i>
                <span class="oth_content_title">Humidity: <b>${arr.main.humidity}</b> %</span>
            </div>
        </div>
    </div>  
    `

    weatherCityName = document.querySelector('.weather_city')
    if (contains(activeCities, weatherCityName.getAttribute('data-value'))) {
        weatherCityName.insertAdjacentHTML('beforeend', `
            <button class="addCity delCity"><i class='bx bx-minus'></i></button>
        `)
    } else {
        weatherCityName.insertAdjacentHTML('beforeend', `
            <button class="addCity"><i class='bx bx-plus'></i></button>
        `)
    }
    addCityBtn = document.querySelector('.addCity')
    addCityBtn.addEventListener('click', () => {
        if (addCityBtn.classList.contains('delCity')) {
            removeActiveCity()
        } else {
            console.log('add');
            addActiveCity()
        }
        // addCitiesLocaleStorage()
    })
}
// добавление города в выбранные
function addActiveCity() {
    addCityActiveCities()
    sprintActiveCities()
    getActiveItem(citiesArr, 'selectedCities_item_active')
}
// обновление activ cities при добавлении
function addCityActiveCities() {
    addCityBtn.classList.add('delCity')
    addCityBtn.innerHTML = `<i class='bx bx-minus'></i>`
    sessionStorage.setItem(weatherCityName.getAttribute('data-value'), 'City')
    activeCities = Object.keys(sessionStorage);
}
// удаление города из выбранных
function removeCityActiveCities() {
    addCityBtn.classList.remove('delCity')
    addCityBtn.innerHTML = `<i class='bx bx-plus'></i>`
    sessionStorage.removeItem(weatherCityName.getAttribute('data-value'))
    activeCities = Object.keys(sessionStorage);
}
// обновление activ cities при удалении
function removeActiveCity() {
    if (activeCities.length != 1) {
        removeCityActiveCities()
        sprintActiveCities()
        getActiveItem(citiesArr, 'selectedCities_item_active')
    } else {
        errorPageDel.classList.remove('hidden')
        setTimeout(() => {
            errorPageDel.classList.add('hidden')
        }, 1000)

    }
}
// функция для обработчика события
async function functionClick() {
    if (inputSearch.value.trim()) {
        // получение данных
        loader.classList.remove('hidden');
        let weatherDay = await getCityWeather(inputSearch.value);
        let weekendInfo = await getCityWeekWeather(inputSearch.value)
        removeActiveItems(citiesArr, 'selectedCities_item_active')
        try {
            sprintDayInfo(weatherDay.data)
            sprintWeekInfo(weekendInfo)
        } catch {
            console.log(error);
        } finally {
            loader.classList.add('hidden');
            inputSearch.value = '';
        }
    }
}
// проверка на присутсвии элемента в массиве
function contains(arr, elem) {
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] === elem) {
            return true;
        }
    }
    return false;
}
// обработчик события
btnSearch.addEventListener('click', functionClick)