async function getData(input) {

	if(input.length > 6)
	{
		let para = document.getElementById('errorMessage');
		para.textContent = "Invalid Flight Number, Enter the IATA flight number";
	}
	else{
		let url = "http://api.aviationstack.com/v1/flights?access_key=b39d1984c7900258091947bda6cbbdb9&flight_iata=" + input;
		fetch(url, { mode: "cors" })
		.then(function (response) {
			return response.json();
		})
		.then(function (data) {
			console.log(data);
			displayData(data);
		})
		.catch(function (error) {
			document.getElementById('errorMessage').textContent = "We could not find any information on flight: " + input;
			console.log(error)
		});
	}
  }
  
  //Submit button is clicked
  let submitBtn = document.querySelector('#FlightNumberSubmitButton');
  
  submitBtn.addEventListener('click', (event) => {

	var elements = document.querySelectorAll('.data');
	elements.forEach(function(element) {
  		element.style.display = 'none';
	});

	var elements = document.querySelectorAll('.SearchMessage');
	elements.forEach(function(element) {
		element.style.display = 'flex';
	});


    let flightNumberInput = document.querySelector('#userInput');
    console.log(flightNumberInput.value);
    getData(flightNumberInput.value);
  });
  
  
  function displayData(data) {
    // declaring variables for all the data needed for delay predictor api call
    let depIata = data["data"]["0"]["departure"]["iata"];
    let arrIata = data["data"]["0"]["arrival"]["iata"];
    //departure times
    let departure = data["data"]["0"]["departure"]["scheduled"];
    let depDate = departure.slice(0, 10);
    let depTime = departure.slice(11, 19);
    //arrival times
    let arrival = data["data"]["0"]["arrival"]["scheduled"];
    let arrDate = arrival.slice(0, 10);
    let arrTime = arrival.slice(11, 19);
    //more data
    let aircraftCode = data["data"]["0"]["flight"]["number"];
    let carrierCode = data["data"]["0"]["airline"]["iata"];
    let flightNumber = data["data"]["0"]["flight"]["number"];
	let gate = data["data"]["0"]["departure"]["gate"];
	
	if(gate === null)
	{
		gate = "No Info"
	}

    let duration = calculateDuration(
      departure.slice(0, 19),
      arrival.slice(0, 19)
    );
    let depAirport = data["data"]["0"]["departure"]["airport"];
    let arrAirport = data["data"]["0"]["arrival"]["airport"];
  
    console.log(depIata, arrIata, depDate, depTime, arrDate, arrTime, aircraftCode, carrierCode, flightNumber, duration);
    let url2 =
      "https://test.api.amadeus.com/v1/travel/predictions/flight-delay?originLocationCode=" +
      depIata +
      "&destinationLocationCode=" +
      arrIata +
      "&departureDate=" +
      depDate +
      "&departureTime=" +
      depTime.slice(0, 2) +
      "%3A" +
      depTime.slice(3, 5) +
      "%3A00&arrivalDate=" +
      arrDate +
      "&arrivalTime=" +
      arrTime.slice(0, 2) +
      "%3A" +
      arrTime.slice(3, 5) +
      "%3A00&aircraftCode=321" +
      "&carrierCode=" +
      carrierCode +
      "&flightNumber=" +
      flightNumber +
      "&duration=" +
      duration;
	let delayChance = 0
	fetch(url2, {
		headers: { Authorization: "Bearer 8YCz7OHdK1aWcDf0tykNwde8kIfe" },
	})
		.then(function (response) {
			return response.json();
		})
		.then(function (data) {
			console.log("30 minute delay chance: " + data['data']['0']['probability']);
			console.log("60 minute delay chance: " + data['data']['1']['probability']);
			console.log("90 minute delay chance: " + data['data']['2']['probability']);
			console.log("120+ minute delay chance: " + data['data']['3']['probability']);

			let delayCha = document.getElementById("delayChanceForJS");
			delayCha.textContent = '' + 100 * Math.round(data['data']['0']['probability'] * 100) / 100 + '%';
			
		})
		.catch(function (error) {
			console.log("Delay chance API failed");
			console.log(error);
		});

	let departureElement = document.getElementById("departurejs");
	departureElement.textContent = depDate;

	let fromAirportIata = document.getElementById("fromAirportIata");
	fromAirportIata.textContent = depIata;

	let toAirportIata = document.getElementById("toAirportIata");
	toAirportIata.textContent = arrIata;

	let fromGate = document.getElementById("fromGate");
	fromGate.textContent = gate;

	let departureTime = document.getElementById("departureTime");
	departureTime.textContent = depTime;

	let arrivalTime = document.getElementById("arrivalTime");
	arrivalTime.textContent = arrTime;

	let arrAirportName = document.getElementById("arrAirportName");
	arrAirportName.textContent = arrAirport;
	let depAirportName = document.getElementById("depAirportName");
	depAirportName.textContent = depAirport;

	let elements = document.querySelectorAll('.data');
	elements.forEach(function(element) {
  		element.style.display = 'grid';
	});

	let element = document.querySelectorAll('.SearchMessage');
	element.forEach(function(ele) {
		ele.style.display = 'none';
	});
}
  
function calculateDuration(departure, arrival) {
    //calculate flight duration and put it into ISO8601 format
    const departureTime = new Date(departure);
    const arrivalTime = new Date(arrival);
  
    // Calculate the duration in milliseconds
    const durationInMilliseconds = arrivalTime - departureTime;
  
    // Convert milliseconds to duration components
    const durationInSeconds = Math.floor(durationInMilliseconds / 1000);
    const days = Math.floor(durationInSeconds / (24 * 3600));
    const hours = Math.floor((durationInSeconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((durationInSeconds % 3600) / 60);
    const seconds = durationInSeconds % 60;
  
    // Format the duration in ISO 8601 format
    const isoDuration = `P${days}DT${hours}H${minutes}M${seconds}S`;
    return isoDuration;
}