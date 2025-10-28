import { RequestService } from "src/services";
import { AbstractDynamicModule } from "../abstract.module";

interface Data {
}

interface Options {
}

export class FollowersDynamicModule extends AbstractDynamicModule<Data, Options> {
  ALWAYS_RERENDER = true

  public render(): string | Promise<string> {
    
    const followers = RequestService.lastFollowers

    let returnString = '';
    returnString += `<table align="center">\n  <thead>\n    <tr>\n      <th colspan="3" width="512">Last Followers</th>\n    </tr>\n  </thead>\n  <tbody>\n`;
    returnString += JSON.parse(JSON.stringify(followers.lastFollowers)).reverse().map((follower, index) => {
      return `    <tr>\n      <td align="center">${followers.followerCount - (followers.lastFollowers.length - index - 1)}</td>\n      <td align="center">\n        <a href="https://github.com/${follower.login}" target="_blank">\n          <img src="${follower.avatarUrl}" alt="${follower.login}" width="40" height="40"/>\n        </a>\n      </td>\n      <td>\n        <a href="https://github.com/${follower.login}" target="_blank">${follower.login}</a>\n      </td>\n    </tr>\n`;
    }).join('');
    returnString += `    <tr>\n      <td align="center">${followers.followerCount + 1}</td>\n      <td align="center" colspan="2">Maybe You ? (can take a few minutes to update)</td>\n    </tr>`;
    returnString += `\n  </tbody>\n</table>\n`;

    return returnString
  }
}