export class BaseProvider {

  constructor(name){
    this.name = name;
  }

  async chat(messages, options={}){
    throw new Error('chat not implemented');
  }

  async stream(messages, options={}){
    throw new Error('stream not implemented');
  }
}
