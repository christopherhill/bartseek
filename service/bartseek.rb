require 'sinatra'
require 'httparty'
require 'debugger'
require './config'

before do
   content_type :json    
   headers 'Access-Control-Allow-Origin' => '*', 
           'Access-Control-Allow-Methods' => ['OPTIONS', 'GET', 'POST']  
end

BART_SERVICE_STATION_URL = "http://api.bart.gov/api/stn.aspx"
BART_SERVICE_REAL_TIME_URL = "http://api.bart.gov/api/etd.aspx"

disable :protection
set :protection, false

get '/bart/stations' do
    @stations = HTTParty.get( BART_SERVICE_STATION_URL,
    						  :query => { :cmd => "stns", :key => BART_API_KEY })
    @stations.to_json
end

get '/bart/realtime' do
	station = params[:station]
	if station.nil? then
		status 500
  else
    @events = HTTParty.get( BART_SERVICE_REAL_TIME_URL,
    						   :query => { :cmd => "etd", :orig => station, :key => BART_API_KEY })
    @events.to_json
  end
end