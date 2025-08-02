import { Query } from "mongoose";

export class QueryBuilder<T> {
  public modelQuery: Query<T[], T>;
  public readonly query: Record<string, string>;

  constructor(modelQuery: Query<T[], T>, query: Record<string, string>) {
    this.modelQuery = modelQuery;
    this.query = query;
  }

  search(SearchableFields: string[]): this {
    const searchTerm = this.query.searchTerm || "";
    if (searchTerm) {
      const searchQuery = {
        $or: SearchableFields.map((field) => ({
          [field]: { $regex: new RegExp(searchTerm, "i") },
        })),
      };
      this.modelQuery = this.modelQuery.find(searchQuery);
    }
    return this;
  }

  sort(): this {
    const sort = this.query.sort || "-createdAT";
    this.modelQuery = this.modelQuery.sort(sort);
    return this;
  }

  paginate(): this {
    const page = Number(this.query.page) || 1;
    const limit = Number(this.query.limit || 6);
    const skip = (page - 1) * limit;
    this.modelQuery = this.modelQuery.limit(limit).skip(skip);
    return this;
  }

  build() {
    return this.modelQuery;
  }

  async getMeta() {
    const totalDocuments = await this.modelQuery.model.countDocuments();
    const page = Number(this.query.page) || 1;
    const limit = Number(this.query.limit || 6);
    const totalPage = Math.ceil(totalDocuments / limit);

    return { page, limit, total: totalDocuments, totalPage };
  }
}
