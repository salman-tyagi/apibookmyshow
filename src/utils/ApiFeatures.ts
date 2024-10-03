class ApiFeatures {
  constructor(public query: any, private queryReq: any) {}

  get length(): number {
    return this.query.length;
  }

  filter(): this {
    const queryObj = { ...this.queryReq };

    const excludeFields = ['sort', 'fields', 'page', 'limit'];
    excludeFields.forEach(field => delete queryObj[field]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/gt|gte|lt|lte/g, match => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  sort(): this {
    if (this.queryReq.sort) {
      const sortBy = this.queryReq.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  projection(): this {
    if (this.queryReq.fields) {
      const projection = this.queryReq.fields.split(',').join(' ');
      this.query = this.query.select(projection);
    } else {
      this.query = this.query.select('-__v');
    }

    return this;
  }

  pagination(): this {
    const page = parseInt(this.queryReq.page) || 1;
    const limit = parseInt(this.queryReq.limit) || 10;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

export default ApiFeatures;
