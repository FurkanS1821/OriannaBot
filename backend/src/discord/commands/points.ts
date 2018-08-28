import { Command } from "../command";
import { emote, expectChampion, expectUser } from "./util";
import formatName, { badge } from "../../util/format-name";

const PointsCommand: Command = {
    name: "Show Mastery Points",
    smallDescription: "Show how many mastery points you have on a champion.",
    description: `
Shows a user's mastery score on a certain champion. To specify a champion, simply include the champion name in the command. If no champion is specified, the server default is used. Most common abbreviations (e.g. \`lee\` for Lee Sin) will also work.
To specify a user, simply mention them in the message. If no users are mentioned, your own score is shown instead.

Examples:
- @Orianna Bot, how many points do I have on mf?
- @Orianna Bot, how much points does @user#1234 have on Lee Sin?
- @Orianna Bot, how many points do I have?
`.trim(),
    keywords: ["points", "mastery", "score"],
    async handler({ ctx, error, msg, ok }) {
        // Remove the keywords since they can combine with champion names (e.g. **mastery i**relia).
        ctx.content = ctx.content.replace(/\b(points|mastery|score)\b/g, "");

        const user = await expectUser(ctx);p
        await user.$loadRelated("[accounts, stats]");

        const champ = await expectChampion(ctx);
        if (!champ) return;

        if (!user.accounts!.length) return error({
            title: `🔍 ${formatName(user)} Has No Accounts`,
            description: `This command is a lot more useful if I actually have some data to show, but unfortunately ${formatName(user)} has no accounts setup with me. ${msg.author.id === user.snowflake ? "You" : "They"} can add some using \`@Orianna Bot configure\`.`
        });

        const points = user.stats!.find(x => x.champion_id === +champ.key);
        const text = points && points.score ? emote(ctx, "Level_" + points.level) + " **" + points.score.toLocaleString() : "**0";

        return ok({
            title: "📖 Mastery Points",
            description: `<@!${user.snowflake}>${badge(user)} has ${text} points** on ${emote(ctx, champ)} ${champ.name}.`
        });
    }
};
export default PointsCommand;