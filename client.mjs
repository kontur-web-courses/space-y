export class Client {

  async getUser() {
    const response = await fetch("/api/getUser");
    const body = await response.json();
    return body.user;
  }

  async loginUser(username) {
    const data = {
      user: username
    };
    const response = await fetch("/api/loginUser", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });
    const json = await response.json();
    return json.user;
  }

  async logoutUser() {
    return fetch('/api/logoutUser', { method: 'POST' });
  }


  async getInfo() {
    throw new Error("Not implemented");
  }


  async getHistory() {
    throw new Error("Not implemented");
  }


  async getHistoryEvent(id) {
    throw new Error("Not implemented");
  }


  async getRockets() {
    throw new Error("Not implemented");
  }


  async getRocket(id) {
    throw new Error("Not implemented");
  }


  async getRoadster() {
    throw new Error("Not implemented");
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
