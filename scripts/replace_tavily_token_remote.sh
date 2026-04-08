#!/usr/bin/env bash
set -euo pipefail

old="demb7fu3t0o47zecwrh8sidj-170713155518"
token="${1:?expected verification token as first argument}"

image="$(docker inspect "$old" | jq -r '.[0].Config.Image')"
network="$(docker inspect "$old" | jq -r '.[0].HostConfig.NetworkMode')"
restart="$(docker inspect "$old" | jq -r '.[0].HostConfig.RestartPolicy.Name')"

env_args=()
while IFS= read -r line; do
  env_args+=(--env "$line")
done < <(
  docker inspect "$old" \
    | jq -r '.[0].Config.Env[] | select(startswith("MARKETPLACE_VERIFICATION_TOKEN=") | not)'
)

label_args=()
while IFS=$'\t' read -r key value; do
  label_args+=(--label "$key=$value")
done < <(
  docker inspect "$old" \
    | jq -r '.[0].Config.Labels | to_entries[] | "\(.key)\t\(.value)"'
)

docker rm -f "$old"

docker run -d \
  --name "$old" \
  --network "$network" \
  --restart "$restart" \
  "${env_args[@]}" \
  --env "MARKETPLACE_VERIFICATION_TOKEN=$token" \
  "${label_args[@]}" \
  "$image"
