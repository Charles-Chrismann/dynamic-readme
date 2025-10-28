import { Octokit } from "octokit";
import { AppConfigService } from "./ConfigService";
import { AppConfig } from "../declaration";
import State from "../State";
import { Response } from "express";
import { Logger } from "@nestjs/common";

class ReadmeService {
	currentContentSha: string | null = null;
	startDateRender: number;
	private logger = new Logger("ReadmeService")

	async push(octokit: Octokit, message: string, content: string, sha: string): Promise<string> {
		const config = AppConfigService.getOrThrow<AppConfig>('config')
		return (await octokit.request(
			`PUT /repos/${config.datas.repo.owner}/${config.datas.repo.name}/contents/${config.datas.repo.readme.path}`,
			{
				owner: config.datas.repo.owner,
				repo: config.datas.repo.name,
				path: config.datas.repo.readme.path,
				message,
				committer: {
					name: process.env.OCTO_COMMITTER_NAME,
					email: process.env.OCTO_COMMITTER_EMAIL,
				},
				content,
				sha,
			},
		)).data.content.sha
	}

	async renderCommitAndPush(commitMessage: string) {
		const readmeContent = await State.render()

		if(AppConfigService.getOrThrow('NODE_ENV') === "production") {
			await this.commitAndPush(commitMessage, readmeContent)
		} else {
			this.logger.debug(`Commiting: ${commitMessage}`)
		}
	}

	async commitAndPush(commitMessage: string, readmeContent: string) {
		const config = AppConfigService.getOrThrow('config')
		this.startDateRender = Date.now();
		const octokit = new Octokit({ auth: process.env.GH_TOKEN });

		let sha: string | any = this.currentContentSha
		if(!this.currentContentSha) {
			sha = (await octokit.request(
				`GET /repos/${config.datas.repo.owner}/${config.datas.repo.name}/contents/${config.datas.repo.readme.path}`,
			)).data.sha;
		}

		const buffer = Buffer.from(readmeContent);
		const base64 = buffer.toString('base64');
		let pushRespSha: string
		try {
			pushRespSha = await this.push(octokit, commitMessage, base64, sha)
		} catch (e) {
			this.currentContentSha = (await octokit.request(`GET /repos/${config.datas.repo.owner}/${config.datas.repo.name}/contents/${config.datas.repo.readme.path}`)).data.sha
			pushRespSha = await this.push(octokit, commitMessage, base64, this.currentContentSha)
		}
		this.currentContentSha = pushRespSha;
	}

	async updateReadmeAndRedirect(
		commitMessage: string,
		res: Response,
		redirectUrlFragment?: string,
	) {
		if(redirectUrlFragment && !redirectUrlFragment.startsWith('#'))
			throw new Error(`redirectUrlFragment should start with #, received: ${redirectUrlFragment}`)

		await this.renderCommitAndPush(commitMessage)

		const url = AppConfigService.getOrThrow<AppConfig['datas']['repo']['url']>('config.datas.repo.url')
		if(AppConfigService.getOrThrow('NODE_ENV') === "production") res.redirect(url + redirectUrlFragment)
		else res.redirect(`${AppConfigService.APP_BASE_URL}/render${redirectUrlFragment}`)
	}

	doNothingAndRedirect(
		res: Response,
		redirectUrlFragment?: string,
	) {

		this.logger.debug("Do nothing and redirect")

		if(redirectUrlFragment && !redirectUrlFragment.startsWith('#'))
			throw new Error(`redirectUrlFragment should start with #, received: ${redirectUrlFragment}`)

		const url = AppConfigService.getOrThrow<AppConfig['datas']['repo']['url']>('config.datas.repo.url')
		if(AppConfigService.getOrThrow('NODE_ENV') === "production") res.redirect(url + redirectUrlFragment)
		else res.redirect(`${AppConfigService.APP_BASE_URL}/render${redirectUrlFragment}`)
	}
}

export default new ReadmeService()