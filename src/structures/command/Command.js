const SwitchbladeEmbed = require('../SwitchbladeEmbed.js')
const Constants = require('../../utils/Constants.js')
const CommandError = require('./CommandError.js')

/**
 * Base command structure.
 * @constructor
 * @param {Switchblade} client - Switchblade client
 */
module.exports = class Command {
  constructor (client) {
    this.client = client

    this.name = 'CommandName'
    this.aliases = []

    this.hidden = false

    this.requirements = null // Run requirements
    this.parameters = null // Run parameters
  }

  /**
   * Returns true if it can load
   * @returns {boolean} Whether this command can load
   */
  canLoad () {
    return true
  }

  /**
   * Pre-executes itself
   * @param {Message} message Message that triggered it
   * @param {Array<string>} args Command arguments
   */
  async _run (message, args) {
    args = this.handleParameters(message, args)
    if (args instanceof CommandError) return this.error(message, args.message, args.showUsage)

    const requirements = this.handleRequirements(message, args)
    if (requirements instanceof CommandError) return this.error(message, requirements.message, requirements.showUsage)

    return this.run(message, args)
  }

  /**
   * Executes itself
   * @param {Message} message Message that triggered it
   * @param {Array<string>} args Command arguments
   */
  async run () {}

  /**
   * Returns true if it can run
   * @param {Message} message Message that triggered it
   * @param {Array<string>} args Command arguments
   * @returns {boolean} Whether this command can run
   */
  handleRequirements (message, args) {
    return this.requirements ? this.requirements.handle(message, args) : true
  }

  handleParameters (message, args) {
    return this.parameters ? this.parameters.handle(message, args) : args
  }

  /**
   * Apply command cooldown to an user
   * @param {User} user User that triggered it
   * @param {number} time Cooldown time in seconds
   */
  applyCooldown (user, time) {
    return this.requirements && this.requirements.applyCooldown(user, time)
  }

  error (message, title, showUsage = false, customize) {
    const embed = new SwitchbladeEmbed(message.author)
      .setColor(Constants.ERROR_COLOR)
      .setTitle(title)

    if (showUsage) {
      const params = this.parameters ? this.parameters.parameters.map(p => p.required ? `<${p.id}>` : `[<${p.id}>]`).join(' ') : ''
      embed.setDescription(`**Usage:** \`${process.env.PREFIX}${this.name} ${params}\``)
    }

    return message.channel.send(embed).then(() => message.channel.stopTyping())
  }
}
