insert into public.cantons (code, slug, name) values
('AG','aargau','Aargau'),('AI','appenzell-innerrhoden','Appenzell Innerrhoden'),('AR','appenzell-ausserrhoden','Appenzell Ausserrhoden'),
('BE','bern','Bern'),('BL','basel-landschaft','Basel-Landschaft'),('BS','basel-stadt','Basel-Stadt'),('FR','fribourg','Fribourg'),('GE','geneva','Geneva'),
('GL','glarus','Glarus'),('GR','graubunden','Graubunden'),('JU','jura','Jura'),('LU','lucerne','Lucerne'),('NE','neuchatel','Neuchatel'),('NW','nidwalden','Nidwalden'),
('OW','obwalden','Obwalden'),('SG','st-gallen','St. Gallen'),('SH','schaffhausen','Schaffhausen'),('SO','solothurn','Solothurn'),('SZ','schwyz','Schwyz'),
('TG','thurgau','Thurgau'),('TI','ticino','Ticino'),('UR','uri','Uri'),('VD','vaud','Vaud'),('VS','valais','Valais'),('ZG','zug','Zug'),('ZH','zurich','Zurich')
on conflict (code) do nothing;

insert into public.lakes (slug, name, cantons) values
('leman','Lake Geneva', array['VD','GE','VS']),('zurich','Lake Zurich', array['ZH','SG','SZ']),('neuchatel','Lake Neuchatel', array['NE','VD','FR','BE']),
('lucerne','Lake Lucerne', array['LU','UR','SZ','OW','NW']),('constance','Lake Constance', array['TG','SG','SH']),('lugano','Lake Lugano', array['TI']),
('maggiore','Lake Maggiore', array['TI']),('thun','Lake Thun', array['BE']),('biel','Lake Biel', array['BE']),('zug','Lake Zug', array['ZG','SZ','LU']),('murten','Lake Murten', array['FR','VD'])
on conflict (slug) do nothing;

insert into public.categories (slug, name_fr, name_de, name_it, name_en, sort_order) values
('motor-boats','Bateaux a moteur','Motorboote','Barche a motore','Motor boats',1),
('sailing-boats','Voiliers','Segelboote','Barche a vela','Sailing boats',2),
('yachts','Yachts','Yachten','Yacht','Yachts',3),
('day-cruisers','Vedettes','Daycruiser','Day cruiser','Day cruisers',4),
('ribs','Semi-rigides','Schlauchboote','Gommoni','RIBs',5),
('catamarans','Catamarans','Katamarane','Catamarani','Catamarans',6),
('electric-boats','Bateaux electriques','Elektroboote','Barche elettriche','Electric boats',7),
('jet-skis','Motos nautiques','Jetskis','Moto d acqua','Jet skis',8),
('fishing-boats','Bateaux de peche','Fischerboote','Barche da pesca','Fishing boats',9),
('classic-boats','Bateaux classiques','Klassische Boote','Barche classiche','Classic boats',10)
on conflict (slug) do nothing;

insert into public.brands (slug, name) values
('jeanneau','Jeanneau'),('beneteau','Beneteau'),('bavaria','Bavaria'),('quicksilver','Quicksilver'),('cranchi','Cranchi'),('sunseeker','Sunseeker'),
('princess','Princess'),('axopar','Axopar'),('zodiac','Zodiac'),('bayliner','Bayliner'),('nimbus','Nimbus'),('frauscher','Frauscher'),('candela','Candela'),('correct-craft','Correct Craft'),
('riva','Riva'),('lagoon','Lagoon'),('sea-ray','Sea Ray'),('brabus-marine','Brabus Marine'),('azimut','Azimut'),('prestige','Prestige'),('alumacraft','Alumacraft')
on conflict (slug) do nothing;

-- Demo listings are intentionally inserted by the app demo layer until real Supabase users exist.
-- To seed listings in a live project, create demo auth users first, then insert listings with their profile ids.
