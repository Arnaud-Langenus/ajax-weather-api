class RequestHandler {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }

    setApiKey(key) {
        this.key = key;
    }

    getRequest(path) {
        if (this.key) {
            return axios.get(
                `${this.baseUrl}/${path}&units=metric&cnt=7&appid=${this.key}`
            );
        }
    }
}

class LocationService {
    constructor() {
        this.request = new RequestHandler(
            "https://api.openweathermap.org/data/2.5"
        );
        this.request.setApiKey("d5808569f4cd79beab186dd28709d0a9");
    }

    getWeather(location) {
        return this.request.getRequest(`weather?q=${location}`).then(response => {
            const {
                humidity,
                pressure,
                temp,
                temp_min,
                temp_max
            } = response.data.main;
            return {
                name: location,
                humidity,
                pressure,
                temp,
                temp_min,
                temp_max
            };
        });
    }

    getWeatherAverage(location) {
        return this.request.getRequest(`forecast?q=${location}`).then(response => {
            const weatherExtractor = new WeatherExtractor(response.data, location);
            return weatherExtractor.extract();
        });
    }
}

class WeatherExtractor {
    constructor(data, location) {
        this.data = data.list;
        this.location = location;
    }

    extract() {
        const tmp = [];
        const averages = [];
        let i = 0;
        this.data.forEach(day => {
            const { humidity, pressure, temp, temp_min, temp_max } = day.main;
            averages.push({
                name: this.location,
                humidity,
                pressure,
                temp: temp.toFixed(1),
                temp_min: temp_min.toFixed(1),
                temp_max: temp_max.toFixed(1),
                avg: ((temp_max + temp_min) / 2).toFixed(1)
            });
        });
        return averages.filter(avg => (averages.indexOf(avg) + 1) % 3 !== 0);
    }
}
