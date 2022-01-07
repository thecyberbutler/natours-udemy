class APIFeatures {
    constructor(
        query,
        queryStr,
        defaultSort = "-createdAt",
        defaultProject = "-__v"
    ) {
        this.query = query;
        this.queryStr = queryStr;
        this.defaultSort = defaultSort;
        this.defaultProject = defaultProject;
    }

    filter() {
        // Filtering
        const params = { ...this.queryStr };
        const excludedFields = ["page", "sort", "limit", "fields"];
        excludedFields.forEach((el) => {
            delete params[el];
        });

        // Advanced Filtering
        let queryStr = JSON.stringify(params);
        queryStr = JSON.parse(
            queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`)
        );

        this.query.find(queryStr);
        return this;
    }

    sort() {
        if (this.queryStr.sort) {
            this.query.sort(this.queryStr.sort.replace(",", " "));
        } else {
            this.query.sort(this.defaultSort);
        }
        return this;
    }

    limitFields() {
        if (this.queryStr.fields) {
            const fields = this.queryStr.fields.split(",").join(" ");
            this.query.select(fields);
        } else {
            this.query.select(this.defaultProject);
        }
        return this;
    }

    paginate() {
        const limit = this.queryStr.limit * 1 || 10;
        const page = this.queryStr.page * 1 || 1;
        const skip = (page - 1) * limit;

        this.query.skip(skip).limit(limit);

        return this;
    }
}

module.exports = APIFeatures;
