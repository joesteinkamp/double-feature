import React, { Component } from 'react';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.handleLoad = this.handleLoad.bind(this);

    this.state = {
      APIKey: 'y9q8wtsznhu4zf9u9e294xtm',
      dataLoaded: false,
      showTimeDate: '',
      zipCode: '60601',
      timeBufferMin: 5,
      timeBufferMax: 30,
      theaterSelected: false,
      theaterID: '',
      movieSelected: false,
      movieID: '',
      movieName: '',
      movieImage: '',
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

    console.log('Grabbing data');

    // API Call
    var requestURI = 'http://data.tmsapi.com/v1.1/movies/showings?startDate=' +  this.state.showTimeDate + '&zip=' + this.state.zipCode + '&api_key=' + this.state.APIKey;
    
    console.log(requestURI);
  
    fetch(requestURI)
      .then(response=>response.json())
      .then(json=>{
        console.log(json);
        this.setState({
          data: json,
          dataLoaded: true
        });
      });
  }

  handleChangeDate(i) {

    console.log('Change date');
    this.setState({
      showTimeDate: i.target.value
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

    console.log('SUPER TEST' + i.runTime)

    this.setState({ 
      movieID: i.id,
      movieName: i.name,
      movieImage: i.image,
      movieRunTime: i.runTime,
      movieSelected: true
    });

    //console.log('Filtering by selected movie' + i);
  }


  render() {

    var app;

    if (this.state.dataLoaded === false) {
      app = <LocationForm showTimeDate={this.state.showTimeDate} zipCode={this.state.zipCode} onClick={() => this.handleClickGrabData()} onChange={(i) => this.handleChangeDate(i)} />
    }
    else if (this.state.theaterSelected === false ) {
      app = <TheaterList data={this.state.data} onClick={(i) => this.handleClickedTheater(i)} />
    }
    else if (this.state.movieSelected === false ) {
      app = <MoviesList data={this.state.data} selectedTheater={this.state.theaterID} onClick={(i) => this.handleClickedMovie(i)} />
    }
    else {
      app = <MatchList data={this.state.data} selectedTheater={this.state.theaterID} selectedMovie={this.state.movieID} selectedMovieName={this.state.movieName} selectedMovieImage={this.state.movieImage} selectedMovieRunTime={this.state.movieRunTime} timeBufferMin={this.state.timeBufferMin} timeBufferMax={this.state.timeBufferMax} />
    }

    return (
      <div className="App">
        <header className="App-header">
          {app}
        </header>
      </div>
    );
  }
}


class LocationForm extends Component {
  render() {
    return (
      <div className="LocationForm">
        <label htmlFor="showTimeDate">Date: 
        <input id="showTimeDate" type="date" value={this.props.showTimeDate} onChange={(i) => this.props.onChange(i)}></input>
        </label>
        <label htmlFor="zipCode">ZIP
            <input id="zipCode" type="text" pattern="\d*" value={this.props.zipCode}></input>
        </label>
        <label htmlFor="timeWindowBuffer">Time Window Buffer
            <input id="timeWindowBuffer" type="number" value="5"></input>
        </label>
        <label htmlFor="timeWindowRange">Time Window Range
            <input id="timeWindowRange" type="number" value="30"></input>
        </label>
        <button className="" onClick={() => this.props.onClick()}>Find Nearby Movies</button>
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
    this.props.data.map((movie, index) => {
      if (movie.subType === 'Feature Film') {
        movie.showtimes.map((showtime, index) => {
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
      return (
        <li className="theaterItem" id={this.props.theaterID} onClick={(i) => this.props.onClick(this.props.theaterID)}>{this.props.theaterName}</li>
      );
    }
  }


class MoviesList extends Component {
  render () {

    var films = [];
    var filmObjs = [];

    // Go through each movie finding showtimes only for the selected theater
    this.props.data.map((movie, index) => {

      var filmTimes = [];

      // Only grab feature films (because others are missing required data)
      if (movie.subType === `Feature Film`) {
        // Loop through all the showtimes for each film
        movie.showtimes.map((showtime, index) => {
          // Only grab movies at the selected theater
          if (showtime.theatre.id === this.props.selectedTheater) {
            //filmTimes.push(showtime.dateTime);

            if (films.indexOf(movie.title) === -1) {       
              films.push(movie.title);

              var runTime = convertRunTimeToMins(movie.runTime);
              
              var filmObj = {id: movie.rootId, name: movie.title, image: movie.preferredImage.uri, runTime: runTime, genres: movie.genres}
              filmObjs.push(filmObj);  
            }
          }
        });
      }

    });

    console.log('Outputing films')
    console.log(filmObjs);

    return (
      <ul>
        {filmObjs.map((movie, index) => 
          <MovieListItem movieName={movie.name} movieImage={movie.image} movieRunTime={movie.runTime} movieID={movie.id} key={movie.id + movie.name} onClick={(i) => this.props.onClick(i)} />
        )}
      </ul>
    );
  }
}

  class MovieListItem extends Component {

    render () {
      
      
      var movieObj = {id: this.props.movieID, name: this.props.movieName, image: this.props.movieImage, runTime: this.props.movieRunTime};

      return (
        <li onClick={(i) => this.props.onClick(movieObj)}>{this.props.movieName}</li>
      );
    }
  }

class MatchList extends Component {
  render () {

    console.log('Looking for this movie (' + this.props.selectedMovie + ') at this theater (' + this.props.selectedTheater + ')');

    var matches = [];
    var selectedMoviesTimes = [];
    var firstMovieRunTimeMins;

    // Loop through each movie to find selected 
    this.props.data.map((movie, index) => {
      if (movie.rootId === this.props.selectedMovie) {
        console.log('Selected movie found.');

        firstMovieRunTimeMins = convertRunTimeToMins(movie.runTime);

        console.log(firstMovieRunTimeMins);

        // Pull showtimes
        movie.showtimes.map((showtime, index) => {
          // Only at select theater
          if (showtime.theatre.id === this.props.selectedTheater) {
            console.log('Showtime at selected theater found.')

            selectedMoviesTimes.push(showtime.dateTime);
          }
        });
      }

    });

    console.log(selectedMoviesTimes);
      
    // Loop through each movie to find matches 
    this.props.data.map((secondMovie, index) => {
      // Only grab feature films (because others are missing required data)
      if (secondMovie.subType === `Feature Film`) {
        if (secondMovie.rootId !== this.props.selectedMovie) {
          var secondMovieRunTimeMins = convertRunTimeToMins(secondMovie.runTime);
          
          // Pull showtimes
          secondMovie.showtimes.map((showtime, index) => {
            // Only at select theater
            if (showtime.theatre.id === this.props.selectedTheater) {

              // Check if it's a match by comparing every 
              selectedMoviesTimes.map((selectMovieTime, index) => {
                var firstMovieTime = convertTimeToMinutes(selectMovieTime);
                var secondMovieTime = convertTimeToMinutes(showtime.dateTime);

                

                var afterStartWindow = firstMovieTime + firstMovieRunTimeMins + this.props.timeBufferMin;
                var afterEndWindow = firstMovieTime + firstMovieRunTimeMins + this.props.timeBufferMax;
                var beforeStartWindow = secondMovieTime + secondMovieRunTimeMins + this.props.timeBufferMin;
                var beforeEndWindow = secondMovieTime + secondMovieRunTimeMins + this.props.timeBufferMax;
                
                // Check if possible second movie is after selected movie
                if ( secondMovieTime >= afterStartWindow && secondMovieTime <= afterEndWindow ) {
                  console.log('Match found');

                  // Save match
                  var matchObj = { firstMovieID: this.props.selectedMovie, firstMovieName: this.props.selectedMovieName, firstMovieImage: this.props.selectedMovieImage, firstMovieTime: selectMovieTime, firstMovieRunTime: this.props.selectedMovieRunTime, secondMovieID: secondMovie.rootId, secondMovieName: secondMovie.title, secondMovieImage: secondMovie.preferredImage.uri, secondMovieTime: showtime.dateTime, secondMovieRunTime: secondMovieRunTimeMins  };
                  matches.push(matchObj);
                }
                else if ( firstMovieTime >= beforeStartWindow && firstMovieTime <= beforeEndWindow ) {
                  console.log('Match found');

                  console.log('Selected film runtime = ' + this.props.selectedMovieRunTime);
                  
                  // Save match
                  var matchObj = { firstMovieID: secondMovie.rootId, firstMovieName: secondMovie.title, firstMovieImage: secondMovie.preferredImage.uri, firstMovieTime: showtime.dateTime, firstMovieRunTime: secondMovieRunTimeMins, secondMovieID: this.props.selectedMovie, secondMovieName: this.props.selectedMovieName, secondMovieImage: this.props.selectedMovieImage, secondMovieTime: selectMovieTime, secondMovieRunTime: this.props.selectedMovieRunTime };
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

    console.log(matches);

    return (
      <div>
        {matches.map((match, index) => 
            <MatchCard firstMovieID={match.firstMovieID} firstMovieName={match.firstMovieName} firstMovieImage={match.firstMovieImage} firstMovieTime={match.firstMovieTime} firstMovieRunTime={match.firstMovieRunTime} secondMovieID={match.secondMovieID} secondMovieName={match.secondMovieName} secondMovieImage={match.secondMovieImage} secondMovieTime={match.secondMovieTime} secondMovieRunTime={match.secondMovieRunTime} data={this.props.data}  />
        )}
      </div>
    );
  }
}

  class MatchCard extends Component {
    render () {

      var firstMovieTime = convertTimeToHuman(this.props.firstMovieTime);
      var secondMovieTime = convertTimeToHuman(this.props.secondMovieTime);

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
  
  console.log('Convertin time' + time);
  
  // Split by :
  var time = time.split(':');
  var h = time[0];
  var m = time[1];

  var newTime;

  if (h > 12) {
      h = h - 12;
      newTime = h + ':' + m + 'pm';
  }
  else if (h == '0' || h == '00') {
      newTime = '12:' + m + 'am';
  }
  else if (h == '12') {
      newTime = h + ':' + m + 'pm';
  }
  else {
      newTime = h + ':' + m + 'am';
  }

  return newTime;
}