import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from 'src/config/config.service';

@Injectable()
export class RequestService {
    public lastFollowers: {followerCount: number, lastFollowers: {login: string, avatarUrl: string}[]} = {followerCount: 0, lastFollowers: []}

    constructor(
      private configService: ConfigService
    ) {
      this.getFollowers(3).then((followers) => {
        this.lastFollowers = followers
      })
    }

    async getFollowers(limit: number): Promise<{followerCount: number, lastFollowers: {login: string, avatarUrl: string}[]}> {
      const {config} = this.configService
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
