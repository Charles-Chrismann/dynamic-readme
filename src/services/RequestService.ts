import axios from 'axios';
import { AppConfigService } from './ConfigService';

class RequestService {
    public lastFollowers: {followerCount: number, lastFollowers: {login: string, avatarUrl: string}[]} = {followerCount: 0, lastFollowers: []}

    constructor() {}

    async init() {
        this.lastFollowers = await this.getFollowers(3)
    }

    async getFollowers(limit: number): Promise<{followerCount: number, lastFollowers: {login: string, avatarUrl: string}[]}> {
      const config = AppConfigService.getOrThrow('config')
        try {
            const query = `
                query {
                    user(login: "${config.datas.repo.owner}") {
                        totalCount: followers {
                            totalCount
                        }
                        followers(first: ${limit}) {
                            nodes {
                            login
                            avatarUrl
                            }
                        }
                    }
                }`;
                const response = await axios.post('https://api.github.com/graphql', { query }, {
                    headers: {
                      Authorization: `Bearer ${process.env.GH_TOKEN}`,
                    },
                });
                return {
                    followerCount: response.data.data.user.totalCount.totalCount,
                    lastFollowers: response.data.data.user.followers.nodes
                }
        } catch (error) {
            console.error(error)
            return {followerCount: 0, lastFollowers: []}
        }
    }
}

export default new RequestService() 