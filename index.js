const client = new Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS]});
import { MessageActionRow, MessageButton, MessageEmbed } from "discord.js";

const ticketGuild = await client.guilds.fetch("YOUR_SERVER_ID");

if (ticketGuild) {
    const ticketChannel = await ticketGuild.channels.fetch("TICKET_PANEL_CHANNEL_ID");
    if (ticketChannel) {
        const messages = await ticketChannel.messages.fetch();

        if (messages.size == 0 ? true : !messages.first().author.bot) {
            const ticketEmbed = new MessageEmbed()
            .setColor('PANEL_COLOR')
            .setTitle(`PANEL_TITLE`)
            .setDescription(`PANEL_MESSAGE`)
            .setFooter({ text: 'PANEL_FOOTER', iconURL: 'PANEL_FOOTER_IMAGE' })
            .setTimestamp()
            const actionRow = new MessageActionRow();

            actionRow.addComponents(
                new MessageButton()
                .setCustomId("ticket-open")
                .setLabel("OPEN_TICKET_TEXT")
                .setStyle("SECONDARY")
                .setEmoji("📩")
            )

            await ticketChannel.send({embeds: [ticketEmbed], components: [actionRow]});
        };
    };
};

client.on("interactionCreate", async interaction => {
    if (interaction.isButton()) {
        switch (interaction.customId) {
            case "ticket-open":

                const ticketCategory = await ticketGuild.channels.fetch("TICKET_CATEGORY_ID");
                
                if (ticketCategory) {
                    if (ticketCategory.children.find(channel => channel.topic == interaction.user.id)) {
                        await interaction.reply({content: "ALREADY_OPENED_TICKET_MESSAGE", ephemeral: true});
                        return;
                    };

                    const ticketCreateChannel = await ticketGuild.channels.create(`ticket-` + interaction.user.username, {
                        type: "GUILD_TEXT",
                        topic: interaction.user.id,
                        parent: ticketCategory.id,
                        permissionOverwrites: [{
                            id: ticketGuild.roles.everyone.id,
                            deny: ["VIEW_CHANNEL"]
                        },{
                            id: "TEAM_ROLE_ID",
                            allow: ["VIEW_CHANNEL"]
                        },{
                            id: interaction.user.id,
                            allow: ["VIEW_CHANNEL"]
                        }]
                    });

                    const closeEmbed = new MessageEmbed()
                    .setColor('TICKET_INFO_COLOR')
                    .setTitle(`TICKET_INFO_TITLE`)
                    .setDescription(`TICKET_INFO_MESSAGE`)
                    .setFooter({ text: 'TICKET_INFO_FOOTER', iconURL: 'TICKET_INFO_IMAGE' })
                    .setTimestamp()
                    const closeRow = new MessageActionRow()

                    closeRow.addComponents(
                        new MessageButton()
                        .setCustomId("ticket-close")
                        .setLabel("CLOSE_TICKET_TEXT")
                        .setStyle("DANGER")
                        .setEmoji("🔒")
                    );

                    await ticketCreateChannel.send({content: "||@here||", embeds: [closeEmbed], components: [closeRow]});

                    await interaction.reply({content: "OPENED_TICKET_MESSAGE", ephemeral: true});
                }
                break;
            case "ticket-close":
                    await interaction.reply({content: "CLOSE_TICKET_MESSAGE"});
                    await setTimeout(async () => {
                        if (!interaction.message.channel) return;
                        await interaction.message.channel.delete();
                    }, 5000);
                break;
        }
    }
}) 
