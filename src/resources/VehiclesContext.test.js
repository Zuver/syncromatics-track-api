import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import fetchMock from 'fetch-mock';
import Client from '../Client';
import VehiclesContext from './VehiclesContext';
import { vehicles as mockVehicles } from '../mocks';

chai.should();
chai.use(chaiAsPromised);

describe('When building a query for vehicles', () => {
  const client = new Client();
  client.setAuthenticated();

  beforeEach(() => fetchMock
    .get(client.resolve('/1/SYNC/vehicles?page=9&perPage=27&q=valid&sort='), mockVehicles.list)
    .catch(503));
  afterEach(fetchMock.restore);

  let promise;
  beforeEach(() => {
    const vehicles = new VehiclesContext(client, 'SYNC');
    promise = vehicles
      .withPage(9)
      .withPerPage(27)
      .withQuery('valid')
      .getPage();
  });

  it('should make the expected request', () => promise.should.be.fulfilled);
});
