export default interface IReadmeModule {
  toMd: (BASE_URL: string) => Promise<string>
}