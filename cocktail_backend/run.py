from cocktail_maker import app, db
from cocktail_maker.data_gatherer import collect_cocktails_cdb

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    # collect_cocktails_cdb()
    app.run(debug=True)
