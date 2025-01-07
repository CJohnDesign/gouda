import requests

# Full list of elementary schools
school_names = [
    "Addison Mizner Elementary", "Bak Middle School of the Arts (6th Grade)", "Banyan Creek Elementary",
    "Berkshire Elementary", "Binks Forest Elementary", "Boca Raton Elementary", "Calusa Elementary",
    "Cholee Lake Elementary", "Citrus Cove Elementary", "Coral Reef Elementary", "Crosspointe Elementary",
    "Crystal Lakes Elementary", "Dwight D. Eisenhower Elementary", "Egret Lake Elementary",
    "Forest Hill Elementary", "Freedom Shores Elementary", "Golden Grove Elementary", "Gove Elementary",
    "Grassy Waters Elementary", "Hammock Pointe Elementary", "Hidden Oaks Elementary", "Hope-Centennial Elementary",
    "Indian Pines Elementary", "J.C. Mitchell Elementary", "Jupiter Elementary", "Lake Park Elementary",
    "Lantana Elementary", "Limestone Creek Elementary", "Marsh Pointe Elementary", "Melaleuca Elementary",
    "Morikami Park Elementary", "Northboro Elementary", "North Grade Elementary", "Orchard View Elementary",
    "Palm Beach Public", "Palm Springs Elementary", "Pierce Hammock Elementary", "Pine Jog Elementary",
    "Pleasant City Elementary", "Plumosa School of the Arts", "Rolling Green Elementary", "Roosevelt Elementary",
    "Sandpiper Shores Elementary", "South Grade Elementary", "Sunset Palms Elementary",
    "U.B. Kinsey/Palmview Elementary School of the Arts", "Verde K-8", "Waters Edge Elementary",
    "Whispering Pines Elementary", "Wynnebrook Elementary"
]

# Function to get schools in order by latitude (north to south) using Google Places API
def get_schools_in_order():
    api_key = "AIzaSyBcOQNAkaCF93N331cjFpgiU43abT-BZto"
    base_url = "https://maps.googleapis.com/maps/api/place/textsearch/json"
    schools_with_coords = []

    for school in school_names:
        params = {
            "query": school + " Palm Beach County FL",
            "key": api_key
        }
        response = requests.get(base_url, params=params)
        result = response.json()

        if result['status'] == 'OK' and result['results']:
            location = result['results'][0]['geometry']['location']
            schools_with_coords.append({
                "name": school,
                "latitude": location['lat'],
                "longitude": location['lng']
            })
        else:
            print(f"Could not find coordinates for {school}")

    # Sort schools from north to south by latitude
    sorted_schools = sorted(schools_with_coords, key=lambda x: x['latitude'], reverse=True)

    return sorted_schools

# Execute the function and print results
if __name__ == "__main__":
    sorted_schools = get_schools_in_order()
    print("\nSchools ordered from North to South:")
    print("====================================")
    for school in sorted_schools:
        print(f"{school['name']}: {school['latitude']}, {school['longitude']}")
