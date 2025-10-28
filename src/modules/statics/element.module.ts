import { AbstractStaticModule } from "../abstract.module";

type HTMLParentElement = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
type HTMLVoidElement = 'area' | 'base' | 'br' | 'col' | 'embed' | 'hr' | 'img' | 'input' | 'link' | 'meta' | 'param' | 'source' | 'track' | 'wbr'
type HTMLElement = HTMLParentElement | HTMLVoidElement

function isVoidElement(element: HTMLElement): element is HTMLVoidElement {
  const voidElements: HTMLVoidElement[] = [
    'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 
    'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'
  ]
  return voidElements.includes(element as HTMLVoidElement)
}

interface Data {
  element: HTMLElement
  content: string
}

interface Options {
  align: 'start' | 'center' | 'end' | 'justify'
}

export class ElementStaticModule extends AbstractStaticModule<Data, Options> {
  public render(): string | Promise<string> {
    let md = isVoidElement(this.data.element)
      ? `<${this.data.element} />`
      : `<${this.data.element}${this.options?.align ? ` align="${this.options?.align}"` : `` }>${this.data.content}</${this.data.element}>\n`
    this.md = md
    return md
  }
}