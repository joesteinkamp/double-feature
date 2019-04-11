import React, { Component } from 'react';
import Async from 'react-promise';
import './App.css';

const mapBoxToken = 'pk.eyJ1IjoianN0ZWlua2EiLCJhIjoiY2ptMTZqMXV3MTFoazNwcnZ2bXQ3ZmRqaiJ9.usAuyqVA4cunrGMkHdo9bg';

class App extends Component {
  constructor(props) {
    super(props);
    this.handleLoad = this.handleLoad.bind(this);

    this.state = {
      APIKey: 'y9q8wtsznhu4zf9u9e294xtm',
      dataLoaded: false,
      showTimeDate: '2019-02-01',
      zipCode: '60601',
      timeBufferMin: 5,
      timeBufferMax: 30,
      theaterSelected: false,
      theaterID: '',
      movieSelected: false,
      movieID: '',
      movieName: '',
      movieReleaseYear: '',
      movieTempImg: '',
      movieRunTime: '',
      data: []
    };
  }

  componentDidMount() {
    window.addEventListener('load', this.handleLoad);
  }

  handleLoad() {
    // Set to today's date
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1;
    var yyyy = today.getFullYear();

    if(dd<10) { dd = '0' + dd; }
    if(mm<10) { mm = '0' + mm; }
    today = yyyy + '-' + mm + '-' + dd;

    this.setState({showTimeDate: today});

    // Get current zip code of user

  }

  handleClickGrabData() {
    //console.log('Grabbing data');

    // API Call (GraceNote Developer - OnConnect)
    var requestURI = 'http://data.tmsapi.com/v1.1/movies/showings?startDate=' +  this.state.showTimeDate + '&zip=' + this.state.zipCode + '&imageSize=Lg&api_key=' + this.state.APIKey;
  
    fetch(requestURI)
      .then(response=>response.json())
      .then(json=>{
        console.log('API response');
        console.log(json);
        this.setState({
          data: json,
          dataLoaded: true
        });
      });
  }

  handleChangeDate(i) {
    //console.log('Change date');
    this.setState({
      showTimeDate: i.target.value
    });
  }

  handleChangeZIP(i) {
    //console.log('Change ZIP');
    this.setState({
      zipCode: i.target.value
    });
  }

  handleChangeTimeBufferMin(i) {
    //console.log('Change Time Buffer Minimum');
    var timeBufferMin = parseInt(i.target.value);
    this.setState({
      timeBufferMin: timeBufferMin
    });
  }

  handleChangeTimeBufferMax(i) {
    //console.log('Change Time Buffer Maximum');
    var timeBufferMax = parseInt(i.target.value);
    this.setState({
      timeBufferMax: timeBufferMax
    });
  }

  handleChangeTheater(i) {
    //console.log('Change Selected Theater');
    this.setState({
      theaterID: i.target.value
    });
  }

  handleClickedTheater(i) {
    this.setState({ 
      theaterID: i,
      theaterSelected: true
    });

    //console.log('Filtering by selected theater' + i);
  }

  handleClickedMovie(i) {
    this.setState({ 
      movieID: i.id,
      movieName: i.name,
      movieReleaseYear: i.releaseYear,
      movieRunTime: i.runTime,
      movieSelected: true
    });

    //console.log('Filtering by selected movie' + i);
  }


  render() {

    var app;

    if (this.state.dataLoaded === false) {
      app = <LocationForm showTimeDate={this.state.showTimeDate} zipCode={this.state.zipCode} timeBufferMin={this.state.timeBufferMin} timeBufferMax={this.state.timeBufferMax} onClick={() => this.handleClickGrabData()} onChangeDate={(i) => this.handleChangeDate(i)} onChangeZIP={(i) => this.handleChangeZIP(i)} onChangeTimeBufferMin={(i) => this.handleChangeTimeBufferMin(i)} onChangeTimeBufferMax={(i) => this.handleChangeTimeBufferMax(i)} />
    }
    else if (this.state.theaterSelected === false ) {
      app = <TheaterList data={this.state.data} onClick={(i) => this.handleClickedTheater(i)} />
    }
    else if (this.state.movieSelected === false ) {
      app = <MoviesList data={this.state.data} selectedTheater={this.state.theaterID} onClick={(i) => this.handleClickedMovie(i)} />
    }
    else {
      app = 
      <div>
        <FilterForm data={this.state.data} selectedTheater={this.state.theaterID} showTimeDate={this.state.showTimeDate} timeBufferMin={this.state.timeBufferMin} timeBufferMax={this.state.timeBufferMax} onClick={() => this.handleClickGrabData()} onChangeDate={(i) => this.handleChangeDate(i)} onChangeZIP={(i) => this.handleChangeZIP(i)} onChangeTimeBufferMin={(i) => this.handleChangeTimeBufferMin(i)} onChangeTimeBufferMax={(i) => this.handleChangeTimeBufferMax(i)} onChangeTheater={(i) => this.handleChangeTheater(i)} />
        <MatchList data={this.state.data} selectedTheater={this.state.theaterID} selectedMovie={this.state.movieID} selectedMovieName={this.state.movieName} selectedMovieReleaseYear={this.state.movieReleaseYear} selectedMovieRunTime={this.state.movieRunTime} timeBufferMin={this.state.timeBufferMin} timeBufferMax={this.state.timeBufferMax} />
      </div>
    }

    return (
      <div className="App">
        <div className="main-container">
          {app}
        </div>
      </div>
    );
  }
}


class LocationForm extends Component {
  render() {
    return (
      <div className="LocationForm">
        <label htmlFor="showTimeDate">Date: 
        <input id="showTimeDate" type="date" value={this.props.showTimeDate} onChange={(i) => this.props.onChangeDate(i)}></input>
        </label>
        <label htmlFor="zipCode">ZIP
            <input id="zipCode" type="text" pattern="\d*" value={this.props.zipCode} onChange={(i) => this.props.onChangeZIP(i)}></input>
        </label>
        <label htmlFor="timeWindowBuffer">Time Window Buffer
            <input id="timeWindowBuffer" type="number" value={this.props.timeBufferMin} onChange={(i) => this.props.onChangeTimeBufferMin(i)}></input>
        </label>
        <label htmlFor="timeWindowRange">Time Window Range
            <input id="timeWindowRange" type="number" value={this.props.timeBufferMax} onChange={(i) => this.props.onChangeTimeBufferMax(i)}></input>
        </label>
        <button className="" onClick={() => this.props.onClick()}>Find Nearby Movies</button>
      </div>
    );
  }
}

class FilterForm extends Component {  
  refreshPage(){ 
    window.location.reload(); 
  }
  
  render() {

    var theaters = [];
    var theaterObjs = [];

    //console.log(this.props.data);

    // Go through each showtime, find theaters, and store a theater only once
    this.props.data.forEach((movie, index) => {
      if (movie.subType === 'Feature Film') {
        movie.showtimes.forEach((showtime, index) => {
          //console.log(showtime.theatre.name);

          // Check to make sure the theater wasn't already added to the array
          if (theaters.indexOf(showtime.theatre.name) === -1) {
            // Add theater to array
            theaters.push(showtime.theatre.name);
            
            // Create object & object array
            var selectedText = ((showtime.theatre.id === this.props.selectedTheater) ? 'selected' : '');
            var theaterObj = {id: showtime.theatre.id, name: showtime.theatre.name, selected: selectedText};
            theaterObjs.push(theaterObj);
          } 
        });
      }
    });

    return (
      <div className="FilterForm">
        <label htmlFor="timeWindowBuffer">Time Window Buffer
            <input id="timeWindowBuffer" type="number" value={this.props.timeBufferMin} onChange={(i) => this.props.onChangeTimeBufferMin(i)}></input>
        </label>
        <label htmlFor="timeWindowRange">Time Window Range
            <input id="timeWindowRange" type="number" value={this.props.timeBufferMax} onChange={(i) => this.props.onChangeTimeBufferMax(i)}></input>
        </label>
        <label htmlFor="theaterDropdown">Theater
          <select onChange={(i) => this.props.onChangeTheater(i)}>
            {theaterObjs.map((theater, index) => 
              <option value={theater.id} selected={theater.selected}>{theater.name}</option>
            )}
          </select>
        </label>
        <button onClick={this.refreshPage}>New Search</button>
      </div>
    );
  }
}


class TheaterList extends Component {
            
  render () {
    var theaters = [];
    var theaterObjs = [];

    //console.log(this.props.data);

    // Go through each showtime, find theaters, and store a theater only once
    this.props.data.forEach((movie, index) => {
      if (movie.subType === 'Feature Film') {
        movie.showtimes.forEach((showtime, index) => {
          //console.log(showtime.theatre.name);

          // Check to make sure the theater wasn't already added to the array
          if (theaters.indexOf(showtime.theatre.name) === -1) {
            // Add theater to array
            theaters.push(showtime.theatre.name);
            
            // Create object & object array
            var theaterObj = {id: showtime.theatre.id, name: showtime.theatre.name};
            theaterObjs.push(theaterObj);
          } 
        });
      }
    });

    return (
      <div>
        <ol>
          {theaterObjs.map((theater, index) => 
            <TheaterListItem theaterName={theater.name} key={theater.id} theaterID={theater.id} onClick={(i) => this.props.onClick(i)} />
          )}
        </ol>
      </div>
    );
  }
}

  class TheaterListItem extends Component {
    render () {
      var mapImg = geocodeLocation(this.props.theaterName);
      
      // var requestURI = 'https://api.mapbox.com/styles/v1/mapbox/light-v10/static/' + lat +',' + long + ',14.25,0,0/600x600?access_token=' + mapBoxToken;
      

      return (
        <div>
          <li className="theaterItem" id={this.props.theaterID} onClick={(i) => this.props.onClick(this.props.theaterID)}>{this.props.theaterName}</li>
          <Async promise={mapImg} then={(val) => <img src={'https://api.mapbox.com/styles/v1/mapbox/light-v10/static/url-http%3A%2F%2Fdoublefeature.joesteinkamp.com%2Flocation_pin.png(' + val.lat + ',' + val.long + ')/' + val.lat + ',' + val.long +',14.25,0,0/600x600?access_token=' + mapBoxToken} />} />
        </div>
      );
    }
  }


class MoviesList extends Component {
  render () {

    var films = [];
    var filmObjs = [];

    // Go through each movie finding showtimes only for the selected theater
    this.props.data.forEach((movie, index) => {
      // Only grab feature films (because others are missing required data)
      if (movie.subType === `Feature Film`) {
        // Loop through all the showtimes for each film
        movie.showtimes.forEach((showtime, index) => {
          // Only grab movies at the selected theater
          if (showtime.theatre.id === this.props.selectedTheater) {
            //filmTimes.push(showtime.dateTime);

            // If film is already added don't add it OR if there is no runtime
            if (films.indexOf(movie.title) === -1 && movie.runTime != null) {       
              films.push(movie.title);

              var runTime = convertRunTimeToMins(movie.runTime);
              
              var filmObj = {id: movie.rootId, name: movie.title, releaseYear: movie.releaseYear, runTime: runTime, genres: movie.genres}
              filmObjs.push(filmObj);  
            }
          }
        });
      }

    });

    // Sort List of Movies Alphabetically
    filmObjs.sort((a,b) => (a.name.toUpperCase() < b.name.toUpperCase()) ? -1 : (a.name.toUpperCase() > b.name.toUpperCase()) ? 1 : 0  );


    return (
      <div className="movies-list">
        {filmObjs.map((movie, index) => 
          <MovieListItem movieName={movie.name} movieReleaseYear={movie.releaseYear} movieRunTime={movie.runTime} movieID={movie.id} key={movie.id + movie.name} onClick={(i) => this.props.onClick(i)} />
        )}
      </div>
    );
  }
}

  class MovieListItem extends Component {

    render () {
      var movieImg = getPoster(this.props.movieName, this.props.movieReleaseYear);
       
      var movieObj = {id: this.props.movieID, name: this.props.movieName, releaseYear: this.props.movieReleaseYear, runTime: this.props.movieRunTime};

      var optional3DLabel = '';
      if (this.props.movieName.indexOf(' 3D') > -1) {
        optional3DLabel = <p className="threeDlabel">3D</p>
      }

      return (
        <div className="movie-list-item" onClick={(i) => this.props.onClick(movieObj)}>
          {/* {this.props.movieName} ({this.props.movieReleaseYear}) */}
          <Async promise={movieImg} then={(val) => <img src={val} />} />
          { optional3DLabel }
        </div>
      );
    }
  }

class MatchList extends Component {
  render () {

    //console.log('Looking for this movie (' + this.props.selectedMovie + ') at this theater (' + this.props.selectedTheater + ')');
    //console.log(this.props.timeBufferMin + ' - ' + this.props.timeBufferMax);

    var matches = [];
    var selectedMoviesTimes = [];
    var firstMovieRunTimeMins;

    // Loop through each movie to find selected 
    this.props.data.forEach((movie, index) => {
      // Must search for name too because 3D movies get pulled in (WHICH IS FINE BUT NEED TO FIX OUTPUT TO IDENTIFY AS SUCH - NOT IMPLEMENTED YET)
      if (movie.rootId === this.props.selectedMovie && movie.title === this.props.selectedMovieName) {
        //console.log('Selected movie found.');

        firstMovieRunTimeMins = convertRunTimeToMins(movie.runTime);

        // Pull showtimes
        movie.showtimes.forEach((showtime, index) => {
          // Only at selected theater
          if (showtime.theatre.id === this.props.selectedTheater) {
            //console.log('Showtime at selected theater found.')

            selectedMoviesTimes.push(showtime.dateTime);
          }
        });
      }

    });

    console.log(selectedMoviesTimes);
      
    // Loop through each movie to find matches 
    this.props.data.forEach((secondMovie, index) => {
      // Only grab feature films (because others are missing required data)
      if (secondMovie.subType === `Feature Film`) {
        if (secondMovie.rootId !== this.props.selectedMovie && secondMovie.runTime != null) {
          var secondMovieRunTimeMins = convertRunTimeToMins(secondMovie.runTime);
          
          // Pull showtimes
          secondMovie.showtimes.forEach((showtime, index) => {
            // Only at select theater
            if (showtime.theatre.id === this.props.selectedTheater) {

              // Check if it's a match by comparing every 
              selectedMoviesTimes.forEach((selectMovieTime, index) => {
                var firstMovieTime = convertTimeToMinutes(selectMovieTime);
                var secondMovieTime = convertTimeToMinutes(showtime.dateTime);
                

                var afterStartWindow = firstMovieTime + firstMovieRunTimeMins + this.props.timeBufferMin;
                var afterEndWindow = firstMovieTime + firstMovieRunTimeMins + this.props.timeBufferMax;
                var beforeStartWindow = secondMovieTime + secondMovieRunTimeMins + this.props.timeBufferMin;
                var beforeEndWindow = secondMovieTime + secondMovieRunTimeMins + this.props.timeBufferMax;

                var matchObj;

                // Check if possible second movie is after selected movie
                if ( secondMovieTime >= afterStartWindow && secondMovieTime <= afterEndWindow ) {
                  //console.log('Match found');

                  // Save match
                  matchObj = { firstMovieID: this.props.selectedMovie, firstMovieName: this.props.selectedMovieName, firstMovieReleaseYear: this.props.selectedMovieReleaseYear, firstMovieTime: selectMovieTime, firstMovieRunTime: this.props.selectedMovieRunTime, secondMovieID: secondMovie.rootId, secondMovieName: secondMovie.title, secondMovieReleaseYear: secondMovie.releaseYear, secondMovieTime: showtime.dateTime, secondMovieRunTime: secondMovieRunTimeMins  };
                  matches.push(matchObj);
                }
                else if ( firstMovieTime >= beforeStartWindow && firstMovieTime <= beforeEndWindow ) {
                  //console.log('Match found');
                  
                  // Save match
                  matchObj = { firstMovieID: secondMovie.rootId, firstMovieName: secondMovie.title, firstMovieReleaseYear: secondMovie.releaseYear, firstMovieTime: showtime.dateTime, firstMovieRunTime: secondMovieRunTimeMins, secondMovieID: this.props.selectedMovie, secondMovieName: this.props.selectedMovieName, secondMovieReleaseYear: this.props.selectedMovieReleaseYear, secondMovieTime: selectMovieTime, secondMovieRunTime: this.props.selectedMovieRunTime };
                  matches.push(matchObj);
                }
                else {
                  // Not a match
                }

              });
            }
          });
        }
      }
    });

    matches.sort((a, b) => convertTimeToMinutes(a.firstMovieTime) - convertTimeToMinutes(b.firstMovieTime));
    console.log(matches);

    return (
      <div>
        {matches.map((match, index) => 
            <MatchCard firstMovieID={match.firstMovieID} firstMovieName={match.firstMovieName} firstMovieReleaseYear={match.firstMovieReleaseYear} firstMovieTime={match.firstMovieTime} firstMovieRunTime={match.firstMovieRunTime} secondMovieID={match.secondMovieID} secondMovieName={match.secondMovieName} secondMovieReleaseYear={match.secondMovieReleaseYear} secondMovieTime={match.secondMovieTime} secondMovieRunTime={match.secondMovieRunTime} data={this.props.data}  />
        )}
      </div>
    );
  }
}

  class MatchCard extends Component {
    render () {

      var firstMovieTime = convertTimeToHuman(this.props.firstMovieTime);
      var secondMovieTime = convertTimeToHuman(this.props.secondMovieTime);

      // http://developer.tmsimg.com/

      return (
        <div>
          <p>{this.props.firstMovieName} @ {firstMovieTime} ({this.props.firstMovieRunTime}) + {this.props.secondMovieName} at {secondMovieTime} ({this.props.secondMovieRunTime})</p>
        </div>
      );
    }
  }

export default App;





// ***** UTILITY FUNCTIONS ******

// Return runtime of movie in minutes
function convertRunTimeToMins(runTime) {
  // ParseRunTime: Remove first 2 characters & last 1 character
  runTime = runTime.substr(2);
  runTime = runTime.slice(0, -1);
  
  // Split at H
  runTime = runTime.split('H');
  var h = runTime[0];
  var m = runTime[1];

  h = h * 60;
  m = parseInt(m);

  m = h + m;

  return m;
}


// Return scheduled start time of movie into minutes of the day
function convertTimeToMinutes(dateTime) {
  // Ex. '2017-03-05T11:30'
  var time = dateTime.split('T');
  //var date = time[0];
  time = time[1];
  
  time = time.split(':');
  var h = time[0];
  var m = time[1];

  h = h * 60;
  m = parseInt(m);
  m = h + m;

  return m; 
}


function convertTimeToHuman(dateTime) {
  var time = dateTime.split('T');
  time = from24to12(time[1]);

  return time;
}

function from24to12(time) {
  //console.log('Converting time' + time);
  
  // Split by :
  time = time.split(':');
  var h = time[0];
  var m = time[1];

  var newTime;

  if (h > 12) {
      h = h - 12;
      newTime = h + ':' + m + 'pm';
  }
  else if (h === '0' || h === '00') {
      newTime = '12:' + m + 'am';
  }
  else if (h === '12') {
      newTime = h + ':' + m + 'pm';
  }
  else {
      newTime = h + ':' + m + 'am';
  }

  return newTime;
}


function getPoster(name, releaseYear) {
  var apiKey = '19b3319865fc202c784b309fa5d4d0ac'; // TheMovieDB

  if (name.indexOf(' 3D') > -1 ) {
    name = remove3DFromName(name);
  }
  console.log(name);

  // API Call (TheMovieDB.org)
  var requestURI = 'https://api.themoviedb.org/3/search/movie?api_key=' +  apiKey + '&language=en-US&query=' + name + '&include_adult=false&primary_release_year=' + releaseYear;

  return new Promise(function(resolve, reject) {
    fetch(requestURI)
    .then(response=>response.json())
    .then(json=>{
      // Get OMDB Poster
      // var movieImg = json.Poster;

      // Get TheMovieDB Poster
      // Check if array is empty
      if (json.results.length > 0) {
        var movieImg = json.results[0].poster_path;
        movieImg = 'https://image.tmdb.org/t/p/w500' + movieImg;
      }
      else { 
        var movieImg = getPosterOMDB(name, releaseYear).then((value) => {
          return value;
        }); 
      }

      // Return image
      resolve(movieImg);
    });

  });

}


function getPosterOMDB(name, releaseYear) {
  var apiKey = '6fb493e9'; // OMDB

  // API Call (OMDBapi.com)
  var requestURI = 'http://www.omdbapi.com/?apikey=' +  apiKey + '&t=' + name + '&y=' + releaseYear;

  return new Promise(function(resolve, reject) {
    fetch(requestURI)
    .then(response=>response.json())
    .then(json=>{
      console.log(json);

      // Get OMDB Poster
      var movieImg = json.Poster;

      // Return image
      resolve(movieImg);
    });
  });
}


function remove3DFromName(name) {
  name = name.replace(' 3D', '');
  return name;
}




function geocodeLocation(locationName) {

  // Get Geocode of Location
  var requestURI = 'https://api.mapbox.com/geocoding/v5/mapbox.places/' + locationName + '.json?access_token=' + mapBoxToken;

  return new Promise(function(resolve, reject) {
    fetch(requestURI)
    .then(response=>response.json())
    .then(json=>{
      var lat = json.features[0].geometry.coordinates[0];
      var long = json.features[0].geometry.coordinates[1];

      var geocodeObj = {"lat": lat, "long": long};      

      // Return geocode
      resolve(geocodeObj);
    });
  });
}