import React, { Component } from "react";

// Description of each pick that is drafted
type Pick = {
  option: string,
  drafter: string,
  num: number
}

interface AppState {
  /** The string representation of all the drafters in the draft */
  drafters: string,

  /** The current pick number */
  num: number,

  /** The string representation of all available options in the draft*/
  options: string,

  /** The ID of the current draft */
  id: string,

  /** The person's turn it is to pick */
  turn: string,

  /** The page to be displayed */
  page: string,

  /** The name of the user on their version of the draft app */
  drafter: string,

  /** The remaining number of rounds (stored as a string) */
  rounds: string,

  /** The array of all the picks that have been made */
  picks: Pick[],

  /** Stores an error if there is one */
  error: string,

  /** The option that is being picked */
  pick: string,

  /** an array representation of all the drafters */
  draftersArr: string[],

  /** an array representation of all remaining options in the draft */
  optionsArr: string[]
}


export class App extends Component<{}, AppState> {

  constructor(props: any) {
    super(props);

    this.state = {
      drafters: "",
      num: 1,
      options: "",
      id: "",
      turn: "",
      page: "home",
      drafter: "",
      rounds: "",
      picks: [],
      error: "",
      pick: "",
      draftersArr: [],
      optionsArr: []
    };
  }
  
  render = (): JSX.Element => {
    if (this.state.page === "home") {
      return (
        <div>
          <h1>Welcome to Draft!</h1>
          <label htmlFor = "name">Drafter Name: </label>
          <input id = "name" onChange = {(e) => this.setState({drafter: e.target.value})}></input>
          <br />
          <h3>Join Existing Draft</h3>
          <label htmlFor = "id">Draft ID: </label>
          <input id = "id" type = "number" onChange = {(e) => this.setState({id: e.target.value})}></input>
          <button onClick = {this.handleJoin}>Join</button>
          <br />
          <h3>Create New Draft</h3>
          <label htmlFor = "rounds">Number of rounds: </label>
          <input type = "number" id = "rounds" onChange = {(e) => this.setState({rounds: e.target.value})}></input>
          <br /><br />
          <label htmlFor = "options">Options: (one per line)</label>
          <br />
          <textarea rows = {10} cols = {20} id = "options" onChange = {(e) => {this.setState({options: e.target.value})}}></textarea>
          <br />
          <label htmlFor = "drafters">Drafters: (one per line)</label>
          <br />
          <textarea rows = {10} cols = {20} id = "drafters" onChange = {(e) => {this.setState({drafters: e.target.value})}}></textarea>
          <br />
          <button onClick = {this.handleCreate}>Create</button>
          <p style = {{color: "red"}}>{this.state.error}</p>
        </div>
      )
    } 
    else if (this.state.page === "drafting") {
      return (
        <div>
          <h2>Status of Draft ID: {this.state.id}</h2>
          <table>
            <thead>
              <tr>
                <th>Number</th>
                <th>Pick</th>
                <th>Drafter</th>
              </tr>
            </thead>
            <tbody>
              {this.state.picks.map((p, i) => {
                return (
                  <tr key = {i}>
                    <th>{p.num}</th>
                    <th>{p.option}</th>
                    <th>{p.drafter}</th>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <br />
          <div style = {{display: Number(this.state.rounds) === 0 || this.state.optionsArr.length === 0 ? "none" : ""}}>
            <div style = {{display: this.state.drafter === this.state.turn ? "" : "none"}}>
              <select id = "options" value = {this.state.pick} onChange = {(e) => this.setState({pick: e.target.value})}>
                  {this.state.optionsArr.map(o => {
                    return (
                      <option key = {o}>{o}</option>
                    )
                  })}
              </select>
              <button onClick = {this.handlePick}>Pick</button>
            </div>
            <p>{this.state.drafter === this.state.turn ? "It's your pick!" : "Waiting for " + this.state.turn + "'s turn..."}</p>
            <button style = {{display: this.state.drafter === this.state.turn ? "none" : ""}} onClick = {this.handleRefresh}>Refresh</button>
          </div>
          <p style = {{display: Number(this.state.rounds) === 0 || this.state.optionsArr.length === 0 ? "" : "none"}}>Draft is complete</p>
        </div>
      )
    }
    else {
      return <p>Something went wrong</p>
    }
  };

  // for when the user joins an existing draft
  handleJoin = async() => {
    this.setState({error: ""});

    if (this.state.drafter === "") {
      this.setState({error: "Please enter a Drafter Name"});
    }
    else if (this.state.id === "") {
      this.setState({error: "Please enter a Draft ID"});
    }
    else {
      const url = "/api/getDraft?id=" + encodeURIComponent(Number(this.state.id));
      await fetch(url, {
        method: "GET",
      })
      .then(res => res.json())
      .then(data => {
        if (data.draft === "none") {
          this.setState({error: "No existing Draft ID", id: ""})
        }
        else {
          this.setState({
            page: "drafting", 
            drafters: data.draft.drafters.join('/n'), 
            options: data.draft.options.join('/n'), 
            turn: data.draft.turn, 
            optionsArr: data.draft.options, 
            picks: data.draft.picks,
            rounds: data.draft.rounds
          });
        }
      })
      .catch(() => this.setState({error: "Something bad happened with the server"}))
    }
  };

  // for when the user creates a new draft
  handleCreate = async() => {
    this.setState({error: ""});
    const optionsArr = this.state.options.split(/\r?\n/);
    const draftersArr = this.state.drafters.split(/\r?\n/);
    this.setState({draftersArr: draftersArr, optionsArr: optionsArr})
    
    if (this.state.drafter === "") {
      this.setState({error: "Please enter a name for drafter"});
    }
    else if (optionsArr[0] === '' || draftersArr[0] === '') {
      this.setState({error: "One or more fields is missing"});
    }
    else if (optionsArr.length < draftersArr.length) {
      this.setState({error: "Can't have more drafters than options"});
    }
    else if (Number(this.state.rounds) <= 0) {
      this.setState({error: "Please enter a valid number of rounds"});
    }
    else {
      const url = "/api/createDraft";
      await fetch(url, {
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          options: this.state.options,
          rounds: this.state.rounds,
          drafters: this.state.drafters
        }),
        mode: 'cors'
      })
      .then(res => {
        if (res.ok) {
          return res.json();
        } else {
          throw new Error("dawg wtf");
        }
    })
      .then(data => {
        this.setState({turn: data.draft.turn, page: "drafting", id: data.id, pick: this.state.optionsArr[0]})
      })
      .catch(() => this.setState({error: "Something bad happened with the server"}))
    }
  };

  // For when a pick is drafted
  handlePick = async() => {
    const url = "/api/makePick";
    await fetch(url, {
      method: "POST",
      body: JSON.stringify({
        id: this.state.id,
        option: this.state.pick,
        drafter: this.state.drafter,
        number: this.state.num
      }),
      mode: 'cors',
      headers: {'Content-Type': 'application/json'}
    })
    .then(res => {
      if (res.ok) {
        return res.json();
      } else {
        throw new Error("Error parsing information");
      }
    })
    .then(data => {
      this.setState({
        turn: data.draft.turn, 
        optionsArr: data.draft.options, 
        picks: data.draft.picks,
      });
    })
    .catch(() => this.setState({error: "Something bad happened with the server"}))
  };

  // For when the user refreshes the draft page
  handleRefresh = async() => {
    const url = "/api/getDraft?id=" + encodeURIComponent(Number(this.state.id));
      await fetch(url, {
        method: "GET",
      })
      .then(res => res.json())
      .then(data => {
        if (data.draft === "none") {
          this.setState({error: "No existing Draft ID", id: ""})
        }
        else {
          this.setState({
            page: "drafting", 
            drafters: data.draft.drafters.join('/n'), 
            options: data.draft.options.join('/n'), 
            turn: data.draft.turn, 
            optionsArr: data.draft.options, 
            picks: data.draft.picks,
            num: data.num,
            rounds: data.draft.rounds,
          }, () => {
            this.setState({
              pick: this.state.optionsArr[0]
            })
          });
        }
      })
      .catch(() => this.setState({error: "Something bad happened with the server"}))
  };

}