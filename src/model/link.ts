export default class Link {
  rel: string;
  href: string;
  title: string;

  constructor(rel : string, href : string, title : string){
    this.rel=rel;
    this.href = href;
    this.title = title;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromObject(object : any) : Link{
    return new Link(
      object.rel,
      object.href,
      object.title,
    );
  }
}