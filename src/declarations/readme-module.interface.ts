export default interface IReadmeModule {
  toMd: (BASE_URL: string, data: any, options: any) => Promise<string>
}