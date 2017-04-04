import Resource from './Resource';
import MessageTemplate from './MessageTemplate';
import MessageTemplatesContext from './MessageTemplatesContext';
import Route from './Route';
import RoutesContext from './RoutesContext';
import Sign from './Sign';
import SignsContext from './SignsContext';
import Stop from './Stop';
import StopsContext from './StopsContext';
import Tag from './Tag';
import TagsContext from './TagsContext';
import Vehicle from './Vehicle';
import VehiclesContext from './VehiclesContext';

/**
 * Customer resource
 *
 * This acts as the context for accessing all customer-specific data.
 */
class Customer extends Resource {
  /**
   * Creates a new resource
   * @param {Client} client Instance of pre-configured client
   * @param {string} customerCode Customer code
   */
  constructor(client, customerCode) {
    super(client);

    /**
     * Customer code
     * @instance
     */
    this.code = customerCode;
  }

  /**
   * Gets a context for querying this customer's message templates
   * @returns {MessageTemplatesContext} Context for querying this customer's message templates
   */
  messageTemplates() {
    return this.resource(MessageTemplatesContext, this.code);
  }

  /**
   * Gets a message template resource by id
   * @param {Number} id Identity of the message_template
   * @returns {MessageTemplate} MessageTemplate resource
   */
  messageTemplate(id) {
    return this.resource(MessageTemplate, MessageTemplate.makeHref(this.code, id));
  }

  /**
   * Gets a context for querying this customer's routes
   * @returns {RoutesContext} Context for querying this customer's routes
   */
  routes() {
    return this.resource(RoutesContext, this.code);
  }

  /**
   * Gets a route resource by id
   * @param {Number} id Identity of the route
   * @returns {Route} Route resource
   */
  route(id) {
    return this.resource(Route, Route.makeHref(this.code, id));
  }

  /**
   * Gets a context for querying this customer's signs
   * @returns {SignsContext} Context for querying this customer's signs
   */
  signs() {
    return this.resource(SignsContext, this.code);
  }

  /**
   * Gets a sign resource by id
   * @param {Number} id Identity of the sign
   * @returns {Sign} Sign resource
   */
  sign(id) {
    return this.resource(Sign, Sign.makeHref(this.code, id));
  }

  /**
   * Gets a context for querying this customer's stops
   * @returns {StopsContext} Context for querying this customer's stops
   */
  stops() {
    return this.resource(StopsContext, this.code);
  }

  /**
   * Gets a stop resource by id
   * @param {Number} id Identity of the stop
   * @returns {Stop} Stop resource
   */
  stop(id) {
    return this.resource(Stop, Stop.makeHref(this.code, id));
  }

  /**
   * Gets a context for querying this customer's tags
   * @returns {TagContext} Context for querying this customer's tags
   */
  tags() {
    return this.resource(TagsContext, this.code);
  }

  /**
   * Gets a tag resource by id
   * @param {Number} id Identity of the tag
   * @returns {Tag} Tag resource
   */
  tag(id) {
    return this.resource(Tag, Tag.makeHref(this.code, id));
  }

  /**
   * Gets a context for querying this customer's vehicles
   * @returns {VehiclesContext} Context for querying this customer's vehicles
   */
  vehicles() {
    return this.resource(VehiclesContext, this.code);
  }

  /**
   * Gets a vehicle resource by id
   * @param {Number} id Identity of the vehicle
   * @returns {Vehicle} Vehicle resource
   */
  vehicle(id) {
    return this.resource(Vehicle, Vehicle.makeHref(this.code, id));
  }
}

export default Customer;
