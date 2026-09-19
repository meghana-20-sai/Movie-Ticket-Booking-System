import { Theatre } from '../../models/Theatre.js';

export const theatreCommandService = {
  async searchTheatres(entities = {}) {
    const filter = { isActive: true };

    if (entities.query) {
      filter.$or = [
        { name: { $regex: entities.query, $options: 'i' } },
        { city: { $regex: entities.query, $options: 'i' } },
        { amenities: { $in: [new RegExp(entities.query, 'i')] } },
      ];
    }

    if (entities.theatre) {
      filter.name = { $regex: entities.theatre, $options: 'i' };
    }

    const theatres = await Theatre.find(filter).limit(6);

    return {
      type: 'THEATRES_LIST',
      message: theatres.length
        ? `Found ${theatres.length} multiplex location(s):`
        : `Here are all available SmartCine multiplex theatres:`,
      theatres: theatres.length ? theatres : await Theatre.find({ isActive: true }).limit(5),
    };
  },
};
