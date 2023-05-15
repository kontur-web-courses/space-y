export class Client {
  constructor() {
    this.isLogin = false;
    this.username = null;
  }


  async loginUser(username) {
    let data = {username: username};
    console.log(data);
    let response = await fetch("https://localhost:3000/api/login", {
      method: "POST",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    this.username = (await response.json())["username"];
    this.isLogin = true;
    return this.username;
  }

  async logoutUser() {
    let data = {username: this.username};
    let response = await fetch("https://localhost:3000/api/unlogin", {
      method: "POST",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    this.isLogin = false;
    this.username = null;
  }

  async getInfo() {
    let response = await fetch('https://api.spacexdata.com/v3/info', {
      method: "GET",
    });
    return await response.json();
  }

  async getHistory() {
    let response = await fetch('https://api.spacexdata.com/v3/history', {
      method: "GET",
    });
    return await response.json();
  }


  async getHistoryEvent(id) {
    let response = await fetch(`https://api.spacexdata.com/v3/history/${id}`, {
      method: "GET",
    });
    return await response.json();
  }

  async getRockets() {
    let response = await fetch('https://api.spacexdata.com/v3/rockets', {
      method: "GET",
    });
    return await response.json();
  }


  async getRocket(id) {
    let response = await fetch(`https://api.spacexdata.com/v3/rockets/${id}`, {
      method: "GET",
    });
    return await response.json();
  }


  async getRoadster() {
    let response = await fetch('https://api.spacexdata.com/v3/roadster', {
      method: "GET",
    });
    return await response.json();
  }

  async getSentToMars() {
    throw new Error("Not implemented");
  }

  async sendToMars(item) {
    throw new Error("Not implemented");
  }

  async cancelSendingToMars(item) {
    throw new Error("Not implemented");
  }
}
