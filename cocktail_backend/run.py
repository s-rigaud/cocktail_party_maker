from cocktail_maker import app, db
from cocktail_maker.data_gatherer import collect_ingredients, collect_cocktails

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    # collect_ingredients()
    # collect_cocktails()
    app.run(debug=True)
